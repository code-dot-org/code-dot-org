/* eslint-disable @typescript-eslint/no-explicit-any */
import {isStagingEnvironment} from '../isStagingEnvironment';

describe('isStagingEnvironment', () => {
  it('should return true if the environment is staging', () => {
    global.window = {
      location: {
        hostname: 'staging-studio.code.org',
      },
    } as any;
    expect(isStagingEnvironment()).toBe(true);
  });

  it('should return false if the environment is not staging', () => {
    global.window = {
      location: {
        hostname: 'code.org',
      },
    } as any;
    expect(isStagingEnvironment()).toBe(false);
  });
});
