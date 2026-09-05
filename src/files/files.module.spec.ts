import { Test, TestingModule } from '@nestjs/testing';
import { FilesModule } from './files.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesModule', () => {
  let module: TestingModule;
  let filesController: FilesController;
  let filesService: FilesService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();

    filesController = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should contain the FilesController and FilesService', () => {
    expect(filesController).toBeDefined();
    expect(filesService).toBeDefined();
  });
});
