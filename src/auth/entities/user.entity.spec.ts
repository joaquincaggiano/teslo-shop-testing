import { User } from './user.entity';

describe('UserEntity', () => {
  it('should create an instance of User', () => {
    const user = new User();
    expect(user).toBeInstanceOf(User);
  });

  it('should clear email before save', () => {
    const user = new User();
    user.email = 'TEST@test.com';
    user.checkFieldsBeforeInsert();
    expect(user.email).toBe('test@test.com');
  });

  it('should clear email before update', () => {
    const user = new User();
    user.email = 'TEST@test.com';
    user.checkFieldsBeforeUpdate();
    expect(user.email).toBe('test@test.com');
  });
});
