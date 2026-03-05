import {getBrandFromHostname} from '../getBrandFromHostname';
import tldts from 'tldts';

describe('getBrandFromHostname', () => {
  it('should return the correct brand for code.org', () => {
    const parsedHostname = tldts.parse('code.org');
    expect(getBrandFromHostname(parsedHostname)).toBe('code.org');
  });

  it('should return the correct brand for aiday.org', () => {
    const parsedHostname = tldts.parse('aiday.org');
    expect(getBrandFromHostname(parsedHostname)).toBe('aiday');
  });

  it('should default to code.org for unknown domains', () => {
    const parsedHostname = tldts.parse('unknown.org');
    expect(getBrandFromHostname(parsedHostname)).toBe('code.org');
  });
});
