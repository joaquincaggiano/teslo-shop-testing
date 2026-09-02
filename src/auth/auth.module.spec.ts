import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

describe('AuthModule', () => {
  let authModule: TestingModule;
  beforeEach(async () => {
    authModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test',
          signOptions: { expiresIn: '1h' },
        }),
        AppModule,
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();
  });

  beforeEach(() => {
    authModule.close();
  });

  it('should be defined', () => {
    expect(authModule).toBeDefined();
  });

  it('should have AuthService as provider', () => {
    const authService = authModule.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should have AuthController as controller', () => {
    const authController = authModule.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
  });

  it('should have JwtStrategy as provider', () => {
    const jwtStrategy = authModule.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
  });

  it('should have PassportModule as module', () => {
    const passportModule = authModule.get<PassportModule>(PassportModule);
    expect(passportModule).toBeDefined();
  });

  it('should have JwtModule as module', () => {
    const jwtModule = authModule.get<JwtModule>(JwtModule);
    expect(jwtModule).toBeDefined();
  });
});
