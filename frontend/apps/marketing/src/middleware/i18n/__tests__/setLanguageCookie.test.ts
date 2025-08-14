import {NextResponse} from 'next/server';

import {Brand} from '@/config/brand';
import {SupportedLocale} from '@/config/locale';
import {Stage} from '@/config/stage';

import {setLanguageCookie} from '../setLanguageCookie';

type MockResponse = {
  cookies: {
    set: jest.Mock;
  };
};

describe('setLanguageCookie', () => {
  let response: MockResponse;

  beforeEach(() => {
    response = {
      cookies: {
        set: jest.fn(),
      },
    };
  });

  it('sets cookie with domain for production CODE_DOT_ORG and allowed hostname', () => {
    setLanguageCookie({
      response: response as unknown as NextResponse,
      maybeLocale: SupportedLocale['en-US'],
      stage: 'production' as Stage,
      brand: Brand.CODE_DOT_ORG,
      hostname: 'code.org',
    });
    expect(response.cookies.set).toHaveBeenCalledWith(
      'language_',
      SupportedLocale['en-US'],
      expect.objectContaining({
        path: '/',
        domain: '.code.org',
      }),
    );
  });

  it('sets cookie with root domain for production CODE_DOT_ORG and disallowed hostname', () => {
    setLanguageCookie({
      response: response as unknown as NextResponse,
      maybeLocale: SupportedLocale['en-US'],
      stage: 'production' as Stage,
      brand: Brand.CODE_DOT_ORG,
      hostname: 'notallowed.com',
    });
    expect(response.cookies.set).toHaveBeenCalledWith(
      'language_',
      SupportedLocale['en-US'],
      expect.objectContaining({
        path: '/',
        domain: '.code.org',
      }),
    );
  });

  it('sets cookie without domain for non-production stage', () => {
    setLanguageCookie({
      response: response as unknown as NextResponse,
      maybeLocale: SupportedLocale['en-US'],
      stage: 'development' as Stage,
      brand: Brand.CODE_DOT_ORG,
      hostname: 'code.org',
    });
    expect(response.cookies.set).toHaveBeenCalledWith(
      'language_',
      SupportedLocale['en-US'],
      expect.objectContaining({
        path: '/',
        domain: undefined,
      }),
    );
  });

  it('sets cookie without domain for non corporate brand', () => {
    setLanguageCookie({
      response: response as unknown as NextResponse,
      maybeLocale: SupportedLocale['en-US'],
      stage: 'production' as Stage,
      brand: Brand.CS_FOR_ALL,
      hostname: 'csforall.org',
    });
    expect(response.cookies.set).toHaveBeenCalledWith(
      'language_',
      SupportedLocale['en-US'],
      expect.objectContaining({
        path: '/',
        domain: undefined,
      }),
    );
  });
});
