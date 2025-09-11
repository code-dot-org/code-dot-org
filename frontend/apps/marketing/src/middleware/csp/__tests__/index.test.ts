import {getCSPHeader} from '../index';

describe('getCSPHeader', () => {
  it('merges first and third party headers into directives for content-security-policy-builder', () => {
    const stage = 'production';
    const cspHeader = getCSPHeader(stage);
    expect(cspHeader).toContain("default-src 'self'");
    expect(cspHeader).toContain('https://dsco.code.org'); // first party
    expect(cspHeader).toContain('https://*.googletagmanager.com'); // third party
  });

  it('includes development values when stage is development', () => {
    const stage = 'development';
    const cspHeader = getCSPHeader(stage);
    expect(cspHeader).toContain('https://localhost-studio.code.org:3000');
  });

  it('does not include development values when stage is production', () => {
    const stage = 'production';
    const cspHeader = getCSPHeader(stage);
    expect(cspHeader).not.toContain('https://localhost-studio.code.org:3000');
  });
});
