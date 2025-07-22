/**
 * @jest-environment node
 */
import {getStage} from '../stage';
import {getStudioBaseUrl, getStudioUrl} from '../studio';

jest.mock('../stage');

describe('getStudioBaseUrl', () => {
  it('should return the development URL when stage is development', () => {
    (getStage as jest.Mock).mockReturnValue('development');
    expect(getStudioBaseUrl()).toBe('http://localhost-studio.code.org:3000');
  });

  it('should return the development URL when stage is pr', () => {
    (getStage as jest.Mock).mockReturnValue('pr');
    expect(getStudioBaseUrl()).toBe('http://localhost-studio.code.org:3000');
  });

  it('should return the test URL when stage is test', () => {
    (getStage as jest.Mock).mockReturnValue('test');
    expect(getStudioBaseUrl()).toBe('https://test-studio.code.org');
  });

  it('should return the production URL when stage is production', () => {
    (getStage as jest.Mock).mockReturnValue('production');
    expect(getStudioBaseUrl()).toBe('https://studio.code.org');
  });

  it('should return the production URL by default when stage is unknown', () => {
    (getStage as jest.Mock).mockReturnValue('unknown');
    expect(getStudioBaseUrl()).toBe('https://studio.code.org');
  });

  describe('levelbuilder special case', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let originalWindow: any;
    beforeEach(() => {
      originalWindow = global.window;
    });
    afterEach(() => {
      if (originalWindow === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).window;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).window = originalWindow;
      }
    });

    it('should return the levelbuilder studio URL when in browser and hostname is levelbuilder.code.org', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).window = {location: {hostname: 'levelbuilder.code.org'}};
      expect(getStudioBaseUrl()).toBe('https://levelbuilder-studio.code.org');
    });

    it('should not throw and should return correct URL when window is undefined (SSR)', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).window;
      (getStage as jest.Mock).mockReturnValue('production');
      expect(() => getStudioBaseUrl()).not.toThrow();
      expect(getStudioBaseUrl()).toBe('https://studio.code.org');
    });
  });
});

describe('getStudioUrl', () => {
  beforeEach(() => {
    (getStage as jest.Mock).mockReturnValue('test');
  });

  it('returns Studio url', () => {
    expect(getStudioUrl()).toBe('https://test-studio.code.org');
  });

  it('returns Studio url for provided path', () => {
    const path = 'test-path';
    expect(getStudioUrl(path)).toBe(`https://test-studio.code.org/${path}`);
  });
});
