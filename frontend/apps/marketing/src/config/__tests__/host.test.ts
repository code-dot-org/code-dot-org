import {getLocalhostDomain, getLocalhostAddress} from '../host';

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
