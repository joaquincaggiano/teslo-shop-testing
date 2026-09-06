import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const testingUser = {
  email: 'testing.user@gmail.com',
  password: 'Abc123',
  fullName: 'Testing User',
};

const testingAdminUser = {
  email: 'testing.admin@gmail.com',
  password: 'Abc123',
  fullName: 'Testing Admin',
};

describe('Auth Login (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdminUser.email });

    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdminUser);

    await userRepository.update(
      { email: testingAdminUser.email },
      { roles: ['admin'] },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - should throw 400 if there is no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login');

    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
    ];

    expect(response.status).toBe(400);
    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message);
    });
  });

  it('/auth/login (POST) - worng credentials - email', async () => {
    const dto = {
      email: 'test3@google.com',
      password: 'Abc123',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(dto);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credentials are not valid (email)');
  });

  it('/auth/login (POST) - worng credentials - password', async () => {
    const dto = {
      email: testingUser.email,
      password: 'Abc1234',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(dto);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credentials are not valid (password)');
  });

  it('/auth/login (POST) - valid credentials', async () => {
    const dto = {
      email: testingUser.email,
      password: testingUser.password,
    };
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(dto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        email: testingUser.email,
        fullName: testingUser.fullName,
        isActive: true,
        roles: ['user'],
      },
      token: expect.any(String),
    });
  });
});
