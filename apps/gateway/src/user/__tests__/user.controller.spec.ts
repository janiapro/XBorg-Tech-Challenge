import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { JwtService } from '../../auth/jwt.service';
import { UserClientAPI } from 'lib-server';
import { SiweService } from '../../siwe/siwe.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuthResponseDTO, LoginDTO, SignUpDTO } from '../types/auth.dto';
import { SiweMessage } from 'siwe';

// Unit test suite for UserController
describe('UserController', () => {
  let userController: UserController;
  let jwtService: jest.Mocked<JwtService>;
  let userAPI: jest.Mocked<UserClientAPI>;
  let siweService: jest.Mocked<SiweService>;

  // Set up the controller and mocked dependencies before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: JwtService,
          useValue: {
            buildAuthRes: jest.fn(),
          },
        },
        {
          provide: UserClientAPI,
          useValue: {
            getUser: jest.fn(),
            signUp: jest.fn(),
          },
        },
        {
          provide: SiweService,
          useValue: {
            verifyMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    jwtService = module.get(JwtService);
    userAPI = module.get(UserClientAPI);
    siweService = module.get(SiweService);
  });

  // Basic test to ensure the controller is defined
  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  // Test the getUser method
  describe('getUser', () => {
    it('should return a user', async () => {
      // Arrange: mock the userAPI.getUser response
      const mockUser = { id: '1', userName: 'testuser' };
      userAPI.getUser.mockResolvedValue(mockUser);

      // Act: call the controller method
      const result = await userController.getUser({ user: { id: '1' } } as any);

      // Assert: check the result and that the mock was called correctly
      expect(result).toEqual(mockUser);
      expect(userAPI.getUser).toHaveBeenCalledWith({ id: '1' });
    });
  });

  // Test the signup method
  describe('signup', () => {
    it('should sign up a user and return an auth response', async () => {
      // Arrange: prepare DTO and mock responses
      const mockSignUpDTO: SignUpDTO = {
        message: 'mockMessage',
        signature: 'mockSignature',
        userName: 'testuser',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Mock a verified SIWE message
      const mockVerified = new SiweMessage({
        domain: 'example.com',
        uri: 'https://example.com',
        version: '1',
        chainId: 1,
        address: '0x1234567890AbcdEF1234567890aBcdef12345678',
        nonce: 'nonce123',
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        notBefore: new Date().toISOString(),
        resources: [],
      });

      const mockUser = { id: '1', userName: 'testuser' };
      const mockAuthResponse: AuthResponseDTO = { token: 'mockToken' };

      // Set up mocks for dependencies
      siweService.verifyMessage.mockResolvedValue(mockVerified);
      userAPI.signUp.mockResolvedValue(mockUser);
      jwtService.buildAuthRes.mockResolvedValue(mockAuthResponse);

      // Act: call the signup method
      const result = await userController.signup(mockSignUpDTO);

      // Assert: check the result and that all dependencies were called correctly
      expect(result).toEqual(mockAuthResponse);
      expect(siweService.verifyMessage).toHaveBeenCalledWith(
        mockSignUpDTO.message,
        mockSignUpDTO.signature,
      );
      expect(userAPI.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: mockSignUpDTO.userName,
          email: mockSignUpDTO.email,
          firstName: mockSignUpDTO.firstName,
          lastName: mockSignUpDTO.lastName,
          address: expect.any(String), // Accept any string address
          message: mockSignUpDTO.message,
          signature: mockSignUpDTO.signature,
        }),
      );
      expect(jwtService.buildAuthRes).toHaveBeenCalledWith(mockUser);
    });

    // Test signup failure when SIWE verification fails
    it('should throw UnauthorizedException if verification fails', async () => {
      // Arrange: prepare DTO and mock rejection
      const mockSignUpDTO: SignUpDTO = {
        message: 'mockMessage',
        signature: 'mockSignature',
        userName: 'testuser',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      siweService.verifyMessage.mockRejectedValue(
        new UnauthorizedException('Verification failed'),
      );

      // Act & Assert: signup should throw UnauthorizedException
      await expect(userController.signup(mockSignUpDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // Test the login method
  describe('login', () => {
    it('should log in a user and return an auth response', async () => {
      // Arrange: prepare DTO and mock responses
      const mockLoginDTO: LoginDTO = {
        message: 'mockMessage',
        signature: 'mockSignature',
      };

      // Mock a verified SIWE message
      const mockVerified = new SiweMessage({
        domain: 'example.com',
        uri: 'https://example.com',
        version: '1',
        chainId: 1,
        address: '0x1234567890AbcdEF1234567890aBcdef12345678',
        nonce: 'nonce123',
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        notBefore: new Date().toISOString(),
        resources: [],
      });

      const mockUser = { id: '1', userName: 'testuser' };
      const mockAuthResponse: AuthResponseDTO = { token: 'mockToken' };

      // Set up mocks for dependencies
      siweService.verifyMessage.mockResolvedValue(mockVerified);
      userAPI.getUser.mockResolvedValue(mockUser);
      jwtService.buildAuthRes.mockResolvedValue(mockAuthResponse);

      // Act: call the login method
      const result = await userController.login(mockLoginDTO);

      // Assert: check the result and that all dependencies were called correctly
      expect(result).toEqual(mockAuthResponse);
      expect(siweService.verifyMessage).toHaveBeenCalledWith(
        mockLoginDTO.message,
        mockLoginDTO.signature,
      );
      expect(userAPI.getUser).toHaveBeenCalledWith({
        address: '0x1234567890AbcdEF1234567890aBcdef12345678',
      });
      expect(jwtService.buildAuthRes).toHaveBeenCalledWith(mockUser);
    });

    // Test login failure when SIWE verification fails
    it('should throw UnauthorizedException if verification fails', async () => {
      // Arrange: prepare DTO and mock rejection
      const mockLoginDTO: LoginDTO = {
        message: 'mockMessage',
        signature: 'mockSignature',
      };

      siweService.verifyMessage.mockRejectedValue(
        new UnauthorizedException('Verification failed'),
      );

      // Act & Assert: login should throw UnauthorizedException
      await expect(userController.login(mockLoginDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
