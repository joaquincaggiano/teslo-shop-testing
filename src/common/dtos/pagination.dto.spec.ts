import { validate } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { plainToClass } from 'class-transformer';

describe('PaginationDto', () => {
  it('should works with default values', async () => {
    const dto = new PaginationDto();
    const errors = await validate(dto);

    expect(dto).toBeDefined();
    expect(errors.length).toBe(0);
  });

  it('should validate limit as positive number', async () => {
    const dto = plainToClass(PaginationDto, { limit: -1 });
    const errors = await validate(dto);
    const limitError = errors.find((error) => error.property === 'limit');

    expect(errors.length).toBeGreaterThan(0);
    expect(limitError).toBeDefined();
    expect(limitError?.constraints).toBeDefined();
    expect(limitError?.constraints?.isPositive).toBe(
      'limit must be a positive number',
    );
  });

  it('should validate offset as positive number', async () => {
    const dto = plainToClass(PaginationDto, { offset: -1 });
    const errors = await validate(dto);
    const offsetError = errors.find((error) => error.property === 'offset');

    expect(errors.length).toBeGreaterThan(0);
    expect(offsetError).toBeDefined();
    expect(offsetError?.constraints).toBeDefined();
    expect(offsetError?.constraints?.min).toBe(
      'offset must not be less than 0',
    );
  });

  it('should allow optional gender with valid values', async () => {
    const validGenders = ['men', 'women', 'unisex', 'kid'];
    validGenders.forEach(async (gender) => {
      const dto = plainToClass(PaginationDto, { gender });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  it('should not allow optional gender with invalid values', async () => {
    const invalidGenders = ['men2', 'women2', 'unisex2', 'kid2'];
    invalidGenders.forEach(async (gender) => {
      const dto = plainToClass(PaginationDto, { gender });
      const errors = await validate(dto);
      const genderError = errors.find((error) => error.property === 'gender');

      expect(errors.length).toBeGreaterThan(0);
      expect(genderError).toBeDefined();
      expect(genderError?.constraints?.isIn).toBeDefined();
    });
  });
});
