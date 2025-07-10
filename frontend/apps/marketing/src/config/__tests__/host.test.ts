import {Brand} from '../brand';
import {
  getLocalhostDomain,
  getLocalhostAddress,
  getCanonicalHostname,
} from '../host';

describe('getLocalhostDomain', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {...OLD_ENV};
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('returns localhost with default port 3000 if PORT is not set', () => {
    delete process.env.PORT;
    expect(getLocalhostDomain()).toBe('localhost:3000');
  });

  it('returns localhost with custom port if PORT is set', () => {
    process.env.PORT = '8080';
    expect(getLocalhostDomain()).toBe('localhost:8080');
  });
});

describe('getLocalhostAddress', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {...OLD_ENV};
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('returns http://localhost:3000 if PORT is not set', () => {
    delete process.env.PORT;
    expect(getLocalhostAddress()).toBe('http://localhost:3000');
  });

  it('returns http://localhost:<PORT> if PORT is set', () => {
    process.env.PORT = '5000';
    expect(getLocalhostAddress()).toBe('http://localhost:5000');
  });
});

describe('getCanonicalHostname', () => {
  const brands = [
    {
      brand: Brand.CODE_DOT_ORG,
      name: 'CODE_DOT_ORG',
      expected: {
        development: 'code.marketing-sites.localhost',
        pr: 'code.marketing-sites.localhost',
        test: 'code.marketing-sites.test-code.org',
        production: 'code.org',
      },
    },
    {
      brand: Brand.HOUR_OF_CODE,
      name: 'HOUR_OF_CODE',
      expected: {
        development: 'hourofcode.marketing-sites.localhost',
        pr: 'hourofcode.marketing-sites.localhost',
        test: 'hourofcode.marketing-sites.test-code.org',
        production: 'hourofcode.com',
      },
    },
    {
      brand: Brand.CS_FOR_ALL,
      name: 'CS_FOR_ALL',
      expected: {
        development: 'csforall.marketing-sites.localhost',
        pr: 'csforall.marketing-sites.localhost',
        test: 'csforall.marketing-sites.test-code.org',
        production: 'csforall.org',
      },
    },
  ];

  const stages: Array<'development' | 'pr' | 'test' | 'production'> = [
    'development',
    'pr',
    'test',
    'production',
  ];

  brands.forEach(({brand, name, expected}) => {
    stages.forEach(stage => {
      it(`returns correct hostname for brand ${name} and stage ${stage}`, () => {
        expect(getCanonicalHostname(brand, stage)).toBe(expected[stage]);
      });
    });
  });
});
