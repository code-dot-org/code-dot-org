import {NextRequest, NextFetchEvent, NextResponse} from 'next/server';

import {SUPPORTED_LOCALES} from '@/config/locale';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';

import {withLocale} from '../withLocale';

jest.mock('@/contentful/slug/getContentfulSlug', () => ({
  getContentfulSlug: jest.fn(),
}));

describe('withLocale middleware', () => {
  const next = jest.fn();
  const mockEvent = {} as NextFetchEvent;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not redirect if the path contains a supported locale', async () => {
    const request = {
      nextUrl: {pathname: '/zh-CN/home'},
      cookies: {get: jest.fn()},
    } as unknown as NextRequest;

    SUPPORTED_LOCALES.add('zh-CN');
    await withLocale(next)(request, mockEvent);

    expect(next).toHaveBeenCalledWith(request, mockEvent);
    expect(getContentfulSlug).not.toHaveBeenCalled();
  });

  it('should redirect to the locale path if no locale is present in the path', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn(() => ({value: 'zh-CN'}))},
    } as unknown as NextRequest;

    SUPPORTED_LOCALES.add('zh-CN');
    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-CN/home',
    );
  });

  it('should default to "en-US" if the cookie locale is not supported', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn(() => ({value: 'unsupported-locale'}))},
    } as unknown as NextRequest;

    SUPPORTED_LOCALES.add('en-US');
    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/en-US/home',
    );
  });

  it('should not redirect if the path is empty', async () => {
    const request = {
      nextUrl: {pathname: '/'},
      cookies: {get: jest.fn()},
    } as unknown as NextRequest;

    await withLocale(next)(request, mockEvent);

    expect(next).toHaveBeenCalledWith(request, mockEvent);
    expect(getContentfulSlug).not.toHaveBeenCalled();
  });

  it('should handle paths with multiple segments correctly', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {
        pathname: '/engineering/all-the-things',
        url: 'https://test.code.org/engineering/all-the-things',
      },
      cookies: {get: jest.fn(() => ({value: 'zh-CN'}))},
    } as unknown as NextRequest;

    SUPPORTED_LOCALES.add('zh-CN');
    (getContentfulSlug as jest.Mock).mockReturnValue(
      'engineering/all-the-things',
    );

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-CN/engineering/all-the-things',
    );
  });
});
