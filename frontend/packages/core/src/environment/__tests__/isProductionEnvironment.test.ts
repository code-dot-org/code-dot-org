/* eslint-disable @typescript-eslint/no-explicit-any */
import {isProductionEnvironment} from '../isProductionEnvironment';

describe('isProductionEnvironment', () => {
  it('should return true if the environment is production', () => {
    global.window = {
      location: {
        hostname: 'studio.code.org',
      },
    } as any;
    expect(isProductionEnvironment()).toBe(true);
  });

  it('should return false if the environment is not production', () => {
    global.window = {
      location: {
        hostname: 'test-studio.code.org',
      },
    } as any;
    expect(isProductionEnvironment()).toBe(false);
  });
});
