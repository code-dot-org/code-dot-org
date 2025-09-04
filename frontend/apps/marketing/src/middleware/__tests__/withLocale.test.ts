import {NextRequest, NextFetchEvent, NextResponse} from 'next/server';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';
import {SUPPORTED_LOCALE_CODES, SupportedLocale} from '@/config/locale';
import {getStage} from '@/config/stage';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';

import {withLocale} from '../withLocale';

jest.mock('@/contentful/slug/getContentfulSlug', () => ({
  getContentfulSlug: jest.fn(),
}));

jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({get: jest.fn()}),
}));

describe('withLocale middleware', () => {
  const cookieMock = {
    set: jest.fn(),
  };
  const next = jest.fn().mockReturnValue({
    cookies: cookieMock,
  });
  const mockEvent = {} as NextFetchEvent;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not redirect if the path contains a supported locale', async () => {
    const request = {
      nextUrl: {pathname: '/zh-Hant/home'},
      cookies: {get: jest.fn()},
      headers: {get: jest.fn()},
      response: {cookies: {set: jest.fn()}},
    } as unknown as NextRequest;

    await withLocale(next)(request, mockEvent);

    expect(next).toHaveBeenCalledWith(request, mockEvent);
    expect(getContentfulSlug).not.toHaveBeenCalled();
    expect(cookieMock.set).toHaveBeenCalledWith(
      'language_',
      'zh-TW' as SupportedLocale,
      {
        domain: undefined,
        path: '/',
      },
    );
  });

  it('should not redirect if the path contains a supported locale - development', async () => {
    const request = {
      nextUrl: {pathname: '/zh-Hant/home'},
      cookies: {get: jest.fn()},
      headers: {get: jest.fn()},
      response: {cookies: {set: jest.fn()}},
    } as unknown as NextRequest;
    (getStage as jest.Mock).mockReturnValue('production');

    await withLocale(next)(request, mockEvent);

    expect(next).toHaveBeenCalledWith(request, mockEvent);
    expect(getContentfulSlug).not.toHaveBeenCalled();
    expect(cookieMock.set).toHaveBeenCalledWith(
      'language_',
      'zh-TW' as SupportedLocale,
      {
        domain: '.code.org',
        path: '/',
      },
    );
  });

  it('should redirect to the locale path if no locale is present in the path for cookies', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn(() => ({value: 'zh-TW' as SupportedLocale}))},
      headers: {get: jest.fn()},
    } as unknown as NextRequest;

    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-Hant/home',
    );
    expect(response?.headers.get('Cache-Control')).toEqual(
      STALE_WHILE_REVALIDATE_ONE_HOUR,
    );
  });

  it('should redirect to the locale path if no locale is present in the path but has accept-language haeder', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn()},
      headers: {
        get: jest.fn().mockReturnValue('zh-Hant;q=0.9'),
      },
    } as unknown as NextRequest;

    SUPPORTED_LOCALE_CODES.push('zh-Hant' as SupportedLocale);
    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-Hant/home',
    );
    expect(response?.headers.get('Cache-Control')).toEqual(
      STALE_WHILE_REVALIDATE_ONE_HOUR,
    );
  });

  it('should default to "en-US" if the cookie and accept-language locale is not supported', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn(() => ({value: 'unsupported-locale'}))},
      headers: {
        get: jest.fn().mockReturnValue('unsupported-locale, en-US;q=0.9'),
      },
    } as unknown as NextRequest;

    SUPPORTED_LOCALE_CODES.push('en-US' as SupportedLocale);
    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/en-US/home',
    );
  });

  it('should redirect to home page if the path is empty', async () => {
    const request = {
      nextUrl: {pathname: '/'},
      cookies: {get: jest.fn()},
      headers: {
        get: jest.fn().mockReturnValue('zh-Hant, en-US;q=0.9'),
      },
      url: 'https://code.marketing-sites.local',
    } as unknown as NextRequest;

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://code.marketing-sites.local/zh-Hant',
    );
  });

  it('should handle paths with multiple segments correctly', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {
        pathname: '/engineering/all-the-things',
        url: 'https://test.code.org/engineering/all-the-things',
      },
      cookies: {get: jest.fn(() => ({value: 'zh-TW' as SupportedLocale}))},
      headers: {get: jest.fn()},
    } as unknown as NextRequest;

    (getContentfulSlug as jest.Mock).mockReturnValue(
      'engineering/all-the-things',
    );

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-Hant/engineering/all-the-things',
    );
  });

  it('should not set language_ cookie or redirect to studio base url when brand is not CODE_DOT_ORG', async () => {
    const request = {
      nextUrl: {pathname: '/zh-Hant/home'},
      cookies: {get: jest.fn()},
      headers: {get: jest.fn().mockReturnValue('csforall.org')},
      response: {cookies: {set: jest.fn()}},
      url: 'https://not-code.org/zh-Hant/home',
    } as unknown as NextRequest;

    await withLocale(next)(request, mockEvent);
  });

  it('should not infinitely redirect for non-corporate brands when locale is unsupported', async () => {
    // Simulate CSForAll brand by setting a non-code.org host
    const request = {
      url: 'https://csforall.org/en-US/home',
      nextUrl: {
        pathname: '/en-US/home',
        url: 'https://csforall.org/en-US/home',
      },
      cookies: {get: jest.fn(() => ({value: 'unsupported-locale'}))},
      headers: {get: jest.fn().mockReturnValue('csforall.org')},
    } as unknown as NextRequest;

    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response?.headers).toBeUndefined();
  });
});
