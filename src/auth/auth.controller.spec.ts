import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      create: jest.fn(),
      login: jest.fn(),
      checkAuthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should create a user with correct dto', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: 'Abc123',
      fullName: 'Test User',
    };

    await authController.createUser(dto);

    expect(authService.create).toHaveBeenCalledWith(dto);
  });

  it('should login a user with correct dto', async () => {
    const dto: LoginUserDto = {
      email: 'test@test.com',
      password: 'Abc123',
    };

    await authController.loginUser(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should check-user status with correct user', async () => {
    const user = {
      email: 'test@test.com',
      password: 'Abc123',
      fullName: 'Test User',
    } as User;

    await authController.checkAuthStatus(user);

    expect(authService.checkAuthStatus).toHaveBeenCalledWith(user);
  });

  it('should return a private route data', async () => {
    const user = {
      id: '1',
      email: 'test@test.com',
      password: 'Abc123',
      fullName: 'Test User',
    } as User;

    const request = {} as Express.Request;
    const rawHeaders = ['header1: value 1', 'header2: value 2'];
    const headers = {
      header1: 'value 1',
      header2: 'value 2',
    };

    const result = await authController.testingPrivateRoute(
      request,
      user,
      user.email,
      rawHeaders,
      headers,
    );

    expect(result).toEqual({
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail: user.email,
      rawHeaders,
      headers,
    });
  });
});
