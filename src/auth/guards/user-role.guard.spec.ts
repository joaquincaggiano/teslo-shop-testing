import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ValidRoles } from '../interfaces';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);
    mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  });

  it('should return true if roles are not defined', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return true if roles are empty', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([]);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw an error if user is not found', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([ValidRoles.admin]);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({});

    expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    expect(() => guard.canActivate(mockContext)).toThrow('User not found');
  });

  it('should return true if user has the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([ValidRoles.admin]);
    jest
      .spyOn(mockContext.switchToHttp(), 'getRequest')
      .mockReturnValue({ user: { roles: [ValidRoles.admin] } });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw an error if user does not have the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([ValidRoles.user]);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
      user: { roles: [ValidRoles.admin], fullName: 'John Doe' },
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'John Doe need a valid role: [user]',
    );
  });
});
