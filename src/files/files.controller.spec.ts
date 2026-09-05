import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('FilesController', () => {
  let filesController: FilesController;
  let filesService: FilesService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockFilesService = {
      getStaticProductImage: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    filesController = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(filesController).toBeDefined();
  });

  it('should return file path when findProductImage is called', () => {
    const mockResponse = {
      sendFile: jest.fn(),
    } as unknown as Response;

    const imageName = 'test.jpg';
    const filePath = `/static/products/${imageName}`;

    jest.spyOn(filesService, 'getStaticProductImage').mockReturnValue(filePath);

    filesController.findProductImage(mockResponse, imageName);

    expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath);
  });

  it('should return a secureUrl when uploadProductImage is called with a file', () => {
    const mockFile = {
      file: 'test.jpg',
      filename: 'test.jpg',
    } as unknown as Express.Multer.File;

    const result = filesController.uploadProductImage(mockFile);

    expect(result).toEqual({
      secureUrl: 'http://localhost:3000/files/product/test.jpg',
      fileName: 'test.jpg',
    });
  });

  it('should throw a BadRequestException if file was not provided', () => {
    expect(() => filesController.uploadProductImage(undefined)).toThrow(
      BadRequestException,
    );
  });
});
