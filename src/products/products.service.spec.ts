import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product, ProductImage } from './entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productRepository: Repository<Product>;
  let productImageRepository: Repository<ProductImage>;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 'UUID_VALID',
        title: 'Product 1',
        price: 100,
        slug: 'product-1',
        images: [{ id: '1', url: 'image1.jpg' }],
      }),
    };

    const mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

  describe('create', () => {
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

    it('should throw an error if the product already exists', async () => {
      const dto = {
        title: 'Product 1',
        price: 100,
        images: ['image1.jpg', 'image2.jpg'],
      } as CreateProductDto;

      const user = {
        id: '1',
        email: 'test@test.com',
      } as User;

      jest
        .spyOn(productRepository, 'save')
        .mockRejectedValue({ code: '23505', detail: 'Product already exists' });

      await expect(productsService.create(dto, user)).rejects.toThrow(
        BadRequestException,
      );
      await expect(productsService.create(dto, user)).rejects.toThrow(
        'Product already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const dto: PaginationDto = {
        limit: 10,
        offset: 0,
        gender: 'men',
      };

      const products = [
        {
          id: '1',
          title: 'Product 1',
          price: 100,
          images: [
            { id: '1', url: 'image1.jpg' },
            { id: '2', url: 'image2.jpg' },
          ],
        },
        {
          id: '2',
          title: 'Product 2',
          price: 200,
          images: [
            { id: '3', url: 'image3.jpg' },
            { id: '4', url: 'image4.jpg' },
          ],
        },
      ] as unknown as Product[];

      jest.spyOn(productRepository, 'find').mockResolvedValue(products);
      jest.spyOn(productRepository, 'count').mockResolvedValue(products.length);

      const result = await productsService.findAll(dto);

      expect(result).toEqual({
        count: products.length,
        pages: Math.ceil(products.length / dto.limit),
        products: products.map((product) => ({
          ...product,
          images: product.images.map((img) => img.url),
        })),
      });
    });
  });

  describe('findOne', () => {
    it('should find a product by valid id', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      const product = {
        id: productId,
        title: 'Product 1',
      } as Product;

      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product);

      const result = await productsService.findOne(productId);

      expect(result).toEqual(product);
    });

    it('should throw an error if the product is not found', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);

      await expect(productsService.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(productsService.findOne(productId)).rejects.toThrow(
        `Product with ${productId} not found`,
      );
    });

    it('should find a product by term or slug', async () => {
      const result = await productsService.findOne('product-1');

      expect(result).toEqual({
        id: 'UUID_VALID',
        title: 'Product 1',
        price: 100,
        slug: 'product-1',
        images: [{ id: '1', url: 'image1.jpg' }],
      });
    });
  });
});
