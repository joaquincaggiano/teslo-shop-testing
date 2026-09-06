import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing user',
};

describe('Auth Register (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeEach(async () => {
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

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await userRepository.delete({ email: testingUser.email });
    await app.close();
  });

  it('/auth/register (POST) - no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register');

    const errorMessages = response.body.message;

    expect(response.body.statusCode).toBe(400);
    errorMessages.forEach((message: string) => {
      expect(errorMessages).toContain(message);
    });
  });

  it('/auth/register (POST) - same email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toBe(
      `Key (email)=(${testingUser.email}) already exists.`,
    );
  });

  it('/auth/register (POST) - unsafe password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...testingUser,
        password: '123456',
      });

    const errorMessages = response.body.message;

    expect(response.body.statusCode).toBe(400);
    errorMessages.forEach((message: string) => {
      expect(errorMessages).toContain(message);
    });
  });

  it('/auth/register (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        email: 'testing.user@google.com',
        fullName: 'Testing user',
        id: expect.any(String),
        isActive: true,
        roles: ['user'],
      },
      token: expect.any(String),
    });
  });
});
