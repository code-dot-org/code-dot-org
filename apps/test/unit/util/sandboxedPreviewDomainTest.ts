import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';
import {getPreviewDomain} from '@cdo/apps/util/sandboxedPreviewDomain';

describe('getPreviewDomain', () => {
  afterEach(() => {
    DCDO.reset();
    jest.restoreAllMocks();
  });

  it('defaults to the pre-migration codeprojects.org when nothing is set', () => {
    expect(getPreviewDomain()).toBe('codeprojects.org');
  });

  it('returns codeaiprojects.org when the DCDO flag selects the new domain', () => {
    DCDO.set('sandboxed-preview-domain', 'codeaiprojects.org');
    expect(getPreviewDomain()).toBe('codeaiprojects.org');
  });

  it('falls back to the default for a value outside the allowed domains', () => {
    DCDO.set('sandboxed-preview-domain', 'evil.example');
    expect(getPreviewDomain()).toBe('codeprojects.org');
  });

  it('lets the new-preview-domain experiment override everything for the session', () => {
    jest
      .spyOn(experiments, 'isEnabledAllowingQueryString')
      .mockImplementation(key => key === experiments.NEW_PREVIEW_DOMAIN);
    expect(getPreviewDomain()).toBe('codeaiprojects.org');
  });
});
