/* eslint-disable @typescript-eslint/no-explicit-any */
import {getDashboardApiUrl} from '../getDashboardApiUrl';

describe('getDashboardApiUrl', () => {
  it('should return the correct URL for development', () => {
    expect(getDashboardApiUrl('development')).toBe(
      'http://localhost-studio.code.org:3000',
    );
  });

  it('uses the current Studio origin when Rails serves the app', () => {
    expect(
      getDashboardApiUrl('development', {
        hostname: 'localhost-studio.code.org',
        origin: 'https://localhost-studio.code.org',
      }),
    ).toBe('https://localhost-studio.code.org');
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
