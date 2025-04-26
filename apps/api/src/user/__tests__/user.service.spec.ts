import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';
import { Logger } from '@nestjs/common';

// Unit test suite for UserService
describe('UserService', () => {
  let userService: UserService;

  // Create a stubbed UserRepository using ts-sinon
  const mockUserRepository: StubbedInstance<UserRepository> =
    stubInterface<UserRepository>();

  // Set up the service and mocked repository before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        UserService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  // Test the signup method
  describe('signup', () => {
    it('should successfully signup user', async () => {
      // Arrange: mock repository to resolve with a user
      mockUserRepository.create.resolves(mockUser);

      // Act: call the signup method
      const authResponse = await userService.signup(mockSignupRequest);

      // Assert: check the result and that repository was called with correct args
      expect(authResponse).toEqual(mockUser);
      expect(mockUserRepository.create.calledOnce).toBe(true);
      expect(mockUserRepository.create.firstCall.args[0]).toEqual({
        address: mockSignupRequest.address,
        userName: mockSignupRequest.userName,
        email: mockSignupRequest.email,
        profile: {
          create: {
            firstName: mockSignupRequest.firstName,
            lastName: mockSignupRequest.lastName,
          },
        },
      });
    });

    it('should log the registration process', async () => {
      // Arrange: spy on Logger and mock repository
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      mockUserRepository.create.resolves(mockUser);

      // Act: call the signup method
      await userService.signup(mockSignupRequest);

      // Assert: check that logger was called with the expected message
      expect(loggerSpy).toHaveBeenCalledWith(
        `Registering new user with address: ${mockSignupRequest.address}`,
      );
    });

    it('should throw an error if UserRepository.create fails', async () => {
      // Arrange: mock repository to reject with an error
      mockUserRepository.create.rejects(new Error('Database error'));

      // Act & Assert: expect the service to throw the same error
      await expect(userService.signup(mockSignupRequest)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
