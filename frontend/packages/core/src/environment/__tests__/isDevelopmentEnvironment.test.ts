/* eslint-disable @typescript-eslint/no-explicit-any */
import {isDevelopmentEnvironment} from '../isDevelopmentEnvironment';

describe('isDevelopmentEnvironment', () => {
  it('should return true if the environment is development', () => {
    global.window = {
      location: {
        hostname: 'localhost-studio.code.org:3000',
      },
    } as any;
    expect(isDevelopmentEnvironment()).toBe(true);
  });

  it('should return false if the environment is not development', () => {
    global.window = {
      location: {
        hostname: 'studio.code.org',
      },
    } as any;
    expect(isDevelopmentEnvironment()).toBe(false);
  });
});
