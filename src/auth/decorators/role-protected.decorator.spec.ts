import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { META_ROLES, RoleProtected } from './role-protected.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn().mockImplementation((key, value) => ({
    key,
    value,
  })),
}));

describe('RoleProtected Decorator', () => {
  it('should set metadata with the correct roles', () => {
    const roles: ValidRoles[] = [
      ValidRoles.admin,
      ValidRoles.superUser,
      ValidRoles.user,
    ];

    const result = RoleProtected(...roles);

    expect(result).toEqual({
      key: META_ROLES,
      value: roles,
    });
    expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles);
  });
});
