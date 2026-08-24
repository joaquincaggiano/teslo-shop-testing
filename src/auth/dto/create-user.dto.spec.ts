import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should have the correct properties', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@test.com';
    dto.password = 'Abc123';
    dto.fullName = 'Test User';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should thorw errors if password is not valid', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@test.com';
    dto.password = 'abc123';
    dto.fullName = 'Test User';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toBeDefined();
    expect(errors[0].constraints?.matches).toBe(
      'The password must have a Uppercase, lowercase letter and a number',
    );
  });
});
