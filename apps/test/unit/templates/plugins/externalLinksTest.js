import {isExternalLink} from '@cdo/apps/templates/plugins/externalLinks';

describe('external links remark plugin', () => {
  it('treats relative links as internal', () => {
    expect(isExternalLink('/educate')).toEqual(false);
    expect(isExternalLink('../../educate')).toEqual(false);
    expect(isExternalLink('/hoc/1')).toEqual(false);
    expect(isExternalLink('puzzle/1')).toEqual(false);
    expect(isExternalLink('test')).toEqual(false);
  });

  it('treats *.code.org links as internal', () => {
    expect(isExternalLink('//code.org/educate')).toEqual(false);
    expect(isExternalLink('http://code.org/educate')).toEqual(false);
    expect(isExternalLink('https://code.org/educate')).toEqual(false);
    expect(isExternalLink('https://studio.code.org/')).toEqual(false);
    expect(isExternalLink('//localhost:3000/s/1')).toEqual(
      false
    );
  });

  it('treats other domain links as external', () => {
    expect(isExternalLink('//example.com')).toEqual(true);
    expect(isExternalLink('http://scratch.org')).toEqual(true);
    expect(isExternalLink('https://www.google.com/')).toEqual(true);
    expect(isExternalLink('//example.com/abc/1/2/3')).toEqual(true);
    expect(isExternalLink('https://not-code.org')).toEqual(true);
    expect(isExternalLink('https://not-code.org:3000/hoc/1')).toEqual(true);
    expect(isExternalLink('https://www.not-code.org')).toEqual(true);
  });
});
