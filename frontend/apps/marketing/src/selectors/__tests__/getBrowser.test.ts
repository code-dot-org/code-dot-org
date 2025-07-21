import {getBrowser, isWebKitEngine} from '../getBrowser';

describe('getBrowser', () => {
  it('returns browser details for a valid user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
      writable: true,
    });

    const result = getBrowser();

    expect(result).toHaveProperty('engine.name', 'WebKit');
    expect(result).toHaveProperty('browser.name', 'Safari');
  });

  it('returns undefined for an invalid user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: '',
      writable: true,
    });

    expect(getBrowser()).toBeUndefined();
  });
});

describe('isWebKitEngine', () => {
  it('returns true for browsers with WebKit engine', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
      writable: true,
    });

    expect(isWebKitEngine()).toBe(true);
  });

  it('returns false for browsers with with non-WebKit engine', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      writable: true,
    });

    expect(isWebKitEngine()).toBe(false);
  });

  it('returns false when browser details are undefined', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: '',
      writable: true,
    });

    expect(isWebKitEngine()).toBe(false);
  });
});
