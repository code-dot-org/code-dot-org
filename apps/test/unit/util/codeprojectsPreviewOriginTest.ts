import DCDO from '@cdo/apps/dcdo';
import {getPreviewDomain} from '@cdo/apps/util/codeprojectsPreviewOrigin';

describe('getPreviewDomain', () => {
  afterEach(() => {
    DCDO.reset();
  });

  it('defaults to codeaiprojects.org when the flag is unset', () => {
    expect(getPreviewDomain()).toBe('codeaiprojects.org');
  });

  it('returns codeprojects.org when the flag reverts to the pre-migration domain', () => {
    DCDO.set('sandboxed-preview-domain', 'codeprojects.org');
    expect(getPreviewDomain()).toBe('codeprojects.org');
  });

  it('falls back to the default for a value outside the allowed domains', () => {
    DCDO.set('sandboxed-preview-domain', 'evil.example');
    expect(getPreviewDomain()).toBe('codeaiprojects.org');
  });
});
