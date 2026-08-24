import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

describe('LoginUserDto', () => {
  it('should have the correct properties', async () => {
    const dto = new LoginUserDto();
    dto.email = 'test@test.com';
    dto.password = 'Abc123';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should thorw errors if password is not valid', async () => {
    const dto = new LoginUserDto();
    dto.email = 'test@test.com';
    dto.password = 'abc123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toBeDefined();
    expect(errors[0].constraints?.matches).toBe(
      'The password must have a Uppercase, lowercase letter and a number',
    );
  });
});
