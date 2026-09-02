import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        password: 'Test1234',
        fullName: 'Test User',
      };

      const user = {
        id: '1',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        isActive: true,
        roles: ['user'],
      };

      jest.spyOn(userRepository, 'create').mockReturnValue(user as User);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('mocked-hashed-password');

      const result = await authService.create(createUserDto);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@test.com',
          fullName: 'Test User',
          isActive: true,
          roles: ['user'],
        },
        token: 'mocked-jwt-token',
      });
    });

    it('should throw an error if the user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        password: 'Test1234',
        fullName: 'Test User',
      };

      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue({ code: '23505', detail: 'Email already exists' });

      await expect(authService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authService.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should throw an internal server error if the user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        password: 'Test1234',
        fullName: 'Test User',
      };

      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue({ code: '9999', detail: 'Internal server error' });

      await expect(authService.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(authService.create(createUserDto)).rejects.toThrow(
        'Please check server logs',
      );

      expect(console.log).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith({
        code: '9999',
        detail: 'Internal server error',
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('should return a user and a token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'Test1234',
      };

      const user = {
        id: '1',
        email: loginUserDto.email,
        fullName: 'Test User',
        isActive: true,
        roles: ['user'],
        password: 'Test1234',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const result = await authService.login(loginUserDto);

      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@test.com',
          fullName: 'Test User',
          isActive: true,
          roles: ['user'],
        },
        token: 'mocked-jwt-token',
      });

      expect(result.user.password).not.toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    it('should throw an error if the user does not exist', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'Test1234',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginUserDto)).rejects.toThrow(
        'Credentials are not valid (email)',
      );
    });

    it('should throw an error if the password is incorrect', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'Test1234',
      };
      const user = {
        id: '1',
        email: loginUserDto.email,
        fullName: 'Test User',
        isActive: true,
        roles: ['user'],
        password: 'Abc123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginUserDto)).rejects.toThrow(
        'Credentials are not valid (password)',
      );
    });
  });

  describe('checkAuthStatus', () => {
    it('should return a user and a token', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        isActive: true,
        roles: ['user'],
      };

      const result = await authService.checkAuthStatus(user as User);

      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@test.com',
          fullName: 'Test User',
          isActive: true,
          roles: ['user'],
        },
        token: 'mocked-jwt-token',
      });
    });
  });
});
