/* eslint-disable @typescript-eslint/no-explicit-any */
import {getDashboardApiUrl} from '../getDashboardApiUrl';

describe('getDashboardApiUrl', () => {
  it('should return the correct URL for development', () => {
    expect(getDashboardApiUrl('development')).toBe(
      'http://localhost-studio.code.org:3000',
    );
  });

  it('should return the correct URL for production', () => {
    expect(getDashboardApiUrl('production')).toBe('https://studio.code.org');
  });

  it('should throw an error for unknown environments', () => {
    expect(() => getDashboardApiUrl('unknown' as any)).toThrowError(
      'Unknown environment: unknown',
    );
  });
});
