import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { SiweService } from '../../siwe/siwe.service';

// E2E test suite for user signup and retrieval
describe('User Signup and Get (e2e)', () => {
  let app: INestApplication;
  let token: string;

  // Setup NestJS application and override SiweService for predictable address
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Mock SiweService.verifyMessage to always resolve with a random address
      .overrideProvider(SiweService)
      .useValue({
        verifyMessage: jest.fn().mockResolvedValue({
          address:
            '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0'),
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    // Use global validation pipe for DTO validation
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  // Test user signup endpoint
  it('should signup a user and return a token', async () => {
    // Use unique userName and email to avoid DB conflicts
    const signupDto = {
      message: 'mockMessage',
      signature: 'mockSignature',
      userName: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    };

    // Send signup request and expect 201 Created
    const res = await request(app.getHttpServer())
      .post('/user/signup')
      .send(signupDto)
      .expect(201);

    // Assert that a token is returned
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  // Test user retrieval endpoint with the returned token
  it('should get the signed up user', async () => {
    const res = await request(app.getHttpServer())
      .get('/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Assert that user data is returned
    expect(res.body).toHaveProperty('userName');
    expect(res.body).toHaveProperty('email');
  });

  // Cleanup after all tests
  afterAll(async () => {
    await app.close();
  });
});
