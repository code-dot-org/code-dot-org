import {getBrandFromHostname} from '../getBrandFromHostname';
import tldjs from 'tldjs';

describe('getBrandFromHostname', () => {
  it('should return the correct brand for code.org', () => {
    const parsedHostname = tldjs.parse('code.org');
    expect(getBrandFromHostname(parsedHostname)).toBe('code.org');
  });

  it('should return the correct brand for aiday.org', () => {
    const parsedHostname = tldjs.parse('aiday.org');
    expect(getBrandFromHostname(parsedHostname)).toBe('aiday');
  });

  it('should default to code.org for unknown domains', () => {
    const parsedHostname = tldjs.parse('unknown.org');
    expect(getBrandFromHostname(parsedHostname)).toBe('code.org');
  });
});
