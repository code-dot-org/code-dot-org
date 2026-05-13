/* eslint-disable @typescript-eslint/no-explicit-any */
import {isTestEnvironment} from '../isTestEnvironment';

describe('isTestEnvironment', () => {
  it('should return true if the environment is test', () => {
    global.window = {
      location: {
        hostname: 'test-studio.code.org',
      },
    } as any;

    expect(isTestEnvironment()).toBe(true);
  });

  it('should return false if the environment is not test', () => {
    global.window = {
      location: {
        hostname: 'code.org',
      },
    } as any;

    expect(isTestEnvironment()).toBe(false);
  });
});
