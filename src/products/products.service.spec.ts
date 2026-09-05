import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product, ProductImage } from './entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/entities/user.entity';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productRepository: Repository<Product>;
  let productImageRepository: Repository<ProductImage>;

  beforeEach(async () => {
    const mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    };

    const mockProductImageRepository = {
      create: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          delete: jest.fn(),
          save: jest.fn(),
        },
        commitTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: mockProductImageRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    productImageRepository = module.get<Repository<ProductImage>>(
      getRepositoryToken(ProductImage),
    );
  });

  it('should be defined', () => {
    expect(productsService).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = {
      title: 'Product 1',
      price: 100,
      images: ['image1.jpg', 'image2.jpg'],
    } as CreateProductDto;

    const user = {
      id: '1',
      email: 'test@test.com',
    } as User;

    const product = {
      id: '1',
      title: dto.title,
      price: dto.price,
      user,
    } as unknown as Product;

    jest.spyOn(productRepository, 'create').mockReturnValue(product);
    jest.spyOn(productRepository, 'save').mockResolvedValue(product);
    jest
      .spyOn(productImageRepository, 'create')
      .mockImplementation((image) => image as unknown as ProductImage);

    const result = await productsService.create(dto, user);

    expect(result).toEqual({
      id: '1',
      title: 'Product 1',
      price: 100,
      images: ['image1.jpg', 'image2.jpg'],
      user: { id: '1', email: 'test@test.com' },
    });
  });
});
