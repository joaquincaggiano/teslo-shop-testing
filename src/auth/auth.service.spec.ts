import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
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

      jest.spyOn(console, 'log').mockImplementation(() => {});

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
    });
  });
});
