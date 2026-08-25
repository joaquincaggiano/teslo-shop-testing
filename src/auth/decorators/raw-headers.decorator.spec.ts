import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRawHeaders } from './raw-headers.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn(),
}));

describe('RawHeaders Decorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        rawHeaders: ['Authorization: Bearer token', 'User-Agent', 'NestJS'],
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the raw headers from the request', () => {
    const result = getRawHeaders(undefined, mockExecutionContext);

    expect(result).toEqual([
      'Authorization: Bearer token',
      'User-Agent',
      'NestJS',
    ]);
  });

  it('should call createParamDecorator with getRawHeaders', () => {
    expect(createParamDecorator).toHaveBeenCalledWith(getRawHeaders);
  });
});
