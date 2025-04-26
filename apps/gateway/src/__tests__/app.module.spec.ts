import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

describe('AppModule', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key) => {
          if (key === 'JWT_SECRET') return 'test-secret';
          return null;
        }),
      })
      .overrideProvider(JwtStrategy)
      .useValue({
        validate: jest.fn(),
      })
      .compile();

    const app = moduleRef.createNestApplication();
    expect(app).toBeDefined();
  });
});
