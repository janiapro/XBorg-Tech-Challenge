import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { SiweService } from '../../siwe/siwe.service';

describe('User Signup and Get (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SiweService)
      .useValue({
        verifyMessage: jest.fn().mockResolvedValue({
          address:
            '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0'),
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  it('should signup a user and return a token', async () => {
    const signupDto = {
      message: 'mockMessage',
      signature: 'mockSignature',
      userName: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    };

    const res = await request(app.getHttpServer())
      .post('/user/signup')
      .send(signupDto)
      .expect(201);

    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get the signed up user', async () => {
    const res = await request(app.getHttpServer())
      .get('/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('userName');
    expect(res.body).toHaveProperty('email');
  });

  afterAll(async () => {
    await app.close();
  });
});
