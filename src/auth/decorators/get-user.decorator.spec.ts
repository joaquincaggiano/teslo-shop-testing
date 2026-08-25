import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn(),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('GetUserDecorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: { id: '1', name: 'John Doe' },
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the user from the request', () => {
    const result = getUser(undefined, mockExecutionContext);
    expect(result).toEqual({ id: '1', name: 'John Doe' });
  });

  it('should throw an error if the user is not found in the request', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => getUser(undefined, mockExecutionContext)).toThrow(
      InternalServerErrorException,
    );
  });

  it('should return the data of the user if it is provided', () => {
    const result = getUser('name', mockExecutionContext);
    expect(result).toEqual('John Doe');
  });

  it('should call createParamDecorator with getUser', () => {
    expect(createParamDecorator).toHaveBeenCalledWith(getUser);
  });
});
