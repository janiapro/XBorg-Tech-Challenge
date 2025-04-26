import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';
import { Logger } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;

  const mockUserRepository: StubbedInstance<UserRepository> =
    stubInterface<UserRepository>();

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

  describe('signup', () => {
    it('should successfully signup user', async () => {
      mockUserRepository.create.resolves(mockUser);

      const authResponse = await userService.signup(mockSignupRequest);

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
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      mockUserRepository.create.resolves(mockUser);

      await userService.signup(mockSignupRequest);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Registering new user with address: ${mockSignupRequest.address}`,
      );
    });

    it('should throw an error if UserRepository.create fails', async () => {
      mockUserRepository.create.rejects(new Error('Database error'));

      await expect(userService.signup(mockSignupRequest)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
