import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { JwtService } from '../../auth/jwt.service';
import { SiweService } from '../../siwe/siwe.service';
import { UserClientAPI } from 'lib-server';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

// Integration test suite for UserController
describe('UserController (Integration)', () => {
  let app: INestApplication;

  // Set up the NestJS application and override providers with mocks
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PassportModule.register({ defaultStrategy: 'jwt' })],
    })
      // Mock JwtService to always return a fixed token
      .overrideProvider(JwtService)
      .useValue({
        buildAuthRes: jest.fn().mockResolvedValue({ token: 'mockToken' }),
      })
      // Mock SiweService to always resolve with a fixed address
      .overrideProvider(SiweService)
      .useValue({
        verifyMessage: jest.fn().mockResolvedValue({ address: 'mockAddress' }),
      })
      // Mock UserClientAPI to simulate user creation and retrieval
      .overrideProvider(UserClientAPI)
      .useValue({
        signUp: jest.fn().mockResolvedValue({ id: '1', userName: 'testuser' }),
        getUser: jest.fn().mockResolvedValue({ id: '1', userName: 'testuser' }),
      })
      // Mock JwtStrategy to always validate successfully
      .overrideProvider(JwtStrategy)
      .useValue({
        validate: jest
          .fn()
          .mockResolvedValue({ id: '1', userName: 'testuser' }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    // Enable global validation pipe for DTO validation
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await app.close();
  });

  describe('POST /user/signup', () => {
    // Test successful signup with valid input
    it('should return 201 and the created user', async () => {
      const newUser = {
        message: 'mockMessage',
        signature: 'mockSignature',
        userName: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/user/signup')
        .send(newUser)
        .expect(201);

      // Assert that the response contains the mock token
      expect(response.body).toHaveProperty('token', 'mockToken');
    });

    // Test validation: should fail with invalid email
    it('should return 400 for invalid input', async () => {
      const invalidUser = {
        message: 'mockMessage',
        signature: 'mockSignature',
        userName: 'testuser',
        email: 'not-an-email',
      };

      const response = await request(app.getHttpServer())
        .post('/user/signup')
        .send(invalidUser)
        .expect(400);

      // Assert that the response contains a validation error message
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email must be an email');
    });
  });
});
