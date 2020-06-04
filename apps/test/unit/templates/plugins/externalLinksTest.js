import {assert} from '../../../util/deprecatedChai';
import {isExternalLink} from '@cdo/apps/templates/plugins/externalLinks';

describe('external links remark plugin', () => {
  it('treats relative links as internal', () => {
    assert.equal(isExternalLink('/educate'), false);
    assert.equal(isExternalLink('../../educate'), false);
    assert.equal(isExternalLink('/hoc/1'), false);
    assert.equal(isExternalLink('puzzle/1'), false);
    assert.equal(isExternalLink('test'), false);
  });

  it('treats *.code.org links as internal', () => {
    assert.equal(isExternalLink('//code.org/educate'), false);
    assert.equal(isExternalLink('http://code.org/educate'), false);
    assert.equal(isExternalLink('https://code.org/educate'), false);
    assert.equal(isExternalLink('https://studio.code.org/'), false);
    assert.equal(isExternalLink('//localhost-studio.code.org:3000/s/1'), false);
  });

  it('treats other domain links as external', () => {
    assert.equal(isExternalLink('//example.com'), true);
    assert.equal(isExternalLink('http://scratch.org'), true);
    assert.equal(isExternalLink('https://www.google.com/'), true);
    assert.equal(isExternalLink('//example.com/abc/1/2/3'), true);
    assert.equal(isExternalLink('https://not-code.org'), true);
    assert.equal(isExternalLink('https://not-code.org:3000/hoc/1'), true);
    assert.equal(isExternalLink('https://www.not-code.org'), true);
  });
});
