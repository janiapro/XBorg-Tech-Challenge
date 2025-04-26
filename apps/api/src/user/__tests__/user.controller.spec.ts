import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { mockSignupRequest, mockUser } from './mocks';

// Unit test suite for UserController in the API app
describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  // Set up the controller and mocked dependencies before each test
  beforeEach(async () => {
    // Mock UserService with a signup method
    const mockUserService = {
      signup: jest.fn().mockResolvedValue(mockUser),
    };

    // Mock UserRepository with find and create methods
    mockUserRepository = {
      find: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    // Create the testing module with mocked providers
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  // Test the signup method
  describe('signup', () => {
    it('should call UserService.signup and return the created user', async () => {
      // Act: call the signup method
      const result = await userController.signup(mockSignupRequest);

      // Assert: check that signup was called and result is correct
      expect(userService.signup).toHaveBeenCalledWith(mockSignupRequest);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if UserService.signup fails', async () => {
      // Arrange: make signup throw an error
      userService.signup.mockRejectedValue(new Error('Signup failed'));

      // Act & Assert: expect the controller to throw the same error
      await expect(userController.signup(mockSignupRequest)).rejects.toThrow(
        'Signup failed',
      );
    });
  });

  // Test the getUser method
  describe('getUser', () => {
    it('should call UserRepository.find and return the user', async () => {
      // Arrange: mock request object
      const mockGetUserRequest = { id: 'uuid', address: 'someethaddress' };

      // Act: call the getUser method
      const result = await userController.getUser(mockGetUserRequest);

      // Assert: check that find was called and result is correct
      expect(mockUserRepository.find).toHaveBeenCalledWith(mockGetUserRequest);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if UserRepository.find fails', async () => {
      // Arrange: make find throw an error
      const mockGetUserRequest = { id: 'uuid', address: 'someethaddress' };
      mockUserRepository.find.mockRejectedValue(new Error('User not found'));

      // Act & Assert: expect the controller to throw the same error
      await expect(userController.getUser(mockGetUserRequest)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
