/* eslint-disable @typescript-eslint/no-explicit-any */
import {isLevelbuilderEnvironment} from '../isLevelbuilderEnvironment';

describe('isLevelbuilderEnvironment', () => {
  it('should return true if the environment is levelbuilder', () => {
    global.window = {
      location: {
        hostname: 'levelbuilder-studio.code.org',
      },
    } as any;
    expect(isLevelbuilderEnvironment()).toBe(true);
  });

  it('should return false if the environment is not levelbuilder', () => {
    global.window = {
      location: {
        hostname: 'code.org',
      },
    } as any;
    expect(isLevelbuilderEnvironment()).toBe(false);
  });
});
