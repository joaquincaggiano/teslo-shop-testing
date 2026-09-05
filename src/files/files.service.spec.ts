import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('FilesService', () => {
  let filesService: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(filesService).toBeDefined();
  });

  it('should return a file path when getStaticProductImage is called', () => {
    const imageName = 'test.jpg';
    const expectedPath = join(__dirname, '../../static/products', imageName);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = filesService.getStaticProductImage(imageName);

    expect(result).toBe(expectedPath);
  });

  it('should throw a BadRequestException if the file does not exist', () => {
    const imageName = 'test.jpg';
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    expect(() => filesService.getStaticProductImage(imageName)).toThrow(
      BadRequestException,
    );
  });
});
