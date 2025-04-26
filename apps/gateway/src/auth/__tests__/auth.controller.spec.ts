import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { JwtService } from '../jwt.service';
import { UserClientAPI } from 'lib-server';
import { SiweService } from '../../siwe/siwe.service';
import {
  mockJwtService,
  mockUserAPI,
  mockSiweService,
} from './auth.controller.mock';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let jwtService: jest.Mocked<JwtService>;
  let userAPI: jest.Mocked<UserClientAPI>;
  let siweService: jest.Mocked<SiweService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserClientAPI, useValue: mockUserAPI },
        { provide: SiweService, useValue: mockSiweService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    jwtService = module.get(JwtService);
    userAPI = module.get(UserClientAPI);
    siweService = module.get(SiweService);
  });

  describe('signup', () => {
    it('should call UserAPI.signUp and return a token', async () => {
      const signupDto = {
        message: 'mockMessage',
        signature: 'mockSignature',
        userName: 'test',
        email: 'test@example.com',
        firstName: 'John', // Add these required fields
        lastName: 'Doe', // Add these required fields
        password: 'test',
      };

      const result = await authController.signup(signupDto);

      expect(siweService.verifyMessage).toHaveBeenCalledWith(
        signupDto.message,
        signupDto.signature,
      );
      expect(userAPI.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: 'test',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          address: 'mockAddress',
          message: 'mockMessage',
          signature: 'mockSignature',
          password: 'test',
        }),
      );
      expect(jwtService.buildAuthRes).toHaveBeenCalledWith({
        id: 'mockUserId',
      });
      expect(result).toEqual({ token: 'mockToken' });
    });
  });

  describe('login', () => {
    it('should call UserAPI.getUser and return a token', async () => {
      const loginDto = { message: 'mockMessage', signature: 'mockSignature' };

      const result = await authController.login(loginDto);

      expect(siweService.verifyMessage).toHaveBeenCalledWith(
        loginDto.message,
        loginDto.signature,
      );
      expect(userAPI.getUser).toHaveBeenCalledWith({ address: 'mockAddress' });
      expect(jwtService.buildAuthRes).toHaveBeenCalledWith({
        id: 'mockUserId',
      });
      expect(result).toEqual({ token: 'mockToken' });
    });

    it('should throw UnauthorizedException if UserAPI.getUser fails', async () => {
      const loginDto = { message: 'mockMessage', signature: 'mockSignature' };
      userAPI.getUser.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
