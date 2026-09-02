import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockReturnValue({
    log: jest.fn(),
  }),
  ValidationPipe: jest.requireActual('@nestjs/common').ValidationPipe,
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn(),
  }),
  ApiProperty: jest.fn(),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue('createDocument'),
    setup: jest.fn(),
  },
}));

jest.mock('./app.module.ts', () => ({
  AppModule: jest.fn().mockReturnValue('AppModule'),
}));

describe('Main', () => {
  let mockApp: {
    setGlobalPrefix: jest.Mock;
    enableCors: jest.Mock;
    useGlobalPipes: jest.Mock;
    listen: jest.Mock;
  };

  let mockLogger: {
    log: jest.Mock;
  };

  beforeEach(() => {
    mockApp = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    mockLogger = {
      log: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    (Logger as unknown as jest.Mock).mockReturnValue(mockLogger);
  });

  it('should create the application with AppModule', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockLogger.log).toHaveBeenCalledWith('App running on port 3000');
  });

  it('should the application listen on env.PORT', async () => {
    process.env.PORT = '5000';
    await bootstrap();

    expect(mockLogger.log).toHaveBeenCalledWith('App running on port 5000');
  });

  it('should set global prefix', async () => {
    await bootstrap();

    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('should use global pipes', async () => {
    await bootstrap();

    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({
        errorHttpStatusCode: expect.any(Number),
        validatorOptions: expect.objectContaining({
          forbidNonWhitelisted: true,
          whitelist: true,
          forbidUnknownValues: false,
        }),
      }),
    );
  });

  it('should call DocumentBuilder', async () => {
    await bootstrap();

    expect(DocumentBuilder).toHaveBeenCalled();
  });

  it('should create swagger document', async () => {
    await bootstrap();

    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      mockApp,
      'createDocument',
    );
  });
});
