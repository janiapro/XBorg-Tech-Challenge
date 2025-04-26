import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockUserService = {
      signup: jest.fn().mockResolvedValue(mockUser),
    };

    mockUserRepository = {
      find: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

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

  describe('signup', () => {
    it('should call UserService.signup and return the created user', async () => {
      const result = await userController.signup(mockSignupRequest);

      expect(userService.signup).toHaveBeenCalledWith(mockSignupRequest);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if UserService.signup fails', async () => {
      userService.signup.mockRejectedValue(new Error('Signup failed'));

      await expect(userController.signup(mockSignupRequest)).rejects.toThrow(
        'Signup failed',
      );
    });
  });

  describe('getUser', () => {
    it('should call UserRepository.find and return the user', async () => {
      const mockGetUserRequest = { id: 'uuid', address: 'someethaddress' };

      const result = await userController.getUser(mockGetUserRequest);

      expect(mockUserRepository.find).toHaveBeenCalledWith(mockGetUserRequest);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if UserRepository.find fails', async () => {
      const mockGetUserRequest = { id: 'uuid', address: 'someethaddress' };
      mockUserRepository.find.mockRejectedValue(new Error('User not found'));

      await expect(userController.getUser(mockGetUserRequest)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
