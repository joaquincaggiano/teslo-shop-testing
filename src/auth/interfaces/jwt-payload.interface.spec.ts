import { JwtPayload } from './jwt-payload.interface';

describe('JwtPayloadInterface', () => {
  it('should return true for a valid payload', () => {
    const payload: JwtPayload = {
      id: 'ABC123',
    };

    expect(payload).toBeDefined();
    expect(payload.id).toBe('ABC123');
  });
});
