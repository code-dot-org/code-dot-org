import DCDO from '@cdo/apps/dcdo';
import {isPyodideSandboxEnabled} from '@cdo/apps/pythonlab/pyodideSandboxEnabled';
import experiments from '@cdo/apps/util/experiments';

describe('isPyodideSandboxEnabled', () => {
  afterEach(() => {
    DCDO.reset();
    jest.restoreAllMocks();
  });

  it('is off when nothing is set', () => {
    expect(isPyodideSandboxEnabled()).toBe(false);
  });

  it('is on when the DCDO flag is true', () => {
    DCDO.set('use-pythonlab-separate-domain', true);
    expect(isPyodideSandboxEnabled()).toBe(true);
  });

  it('is off when the DCDO flag is false', () => {
    DCDO.set('use-pythonlab-separate-domain', false);
    expect(isPyodideSandboxEnabled()).toBe(false);
  });

  it('is off for a non-boolean DCDO value', () => {
    DCDO.set('use-pythonlab-separate-domain', 'true');
    expect(isPyodideSandboxEnabled()).toBe(false);
  });

  it('is on for the pythonlab-separate-domain experiment', () => {
    jest
      .spyOn(experiments, 'isEnabledAllowingQueryString')
      .mockImplementation(key => key === experiments.PYTHONLAB_SEPARATE_DOMAIN);
    expect(isPyodideSandboxEnabled()).toBe(true);
  });

  it('is on for the new-preview-domain experiment', () => {
    jest
      .spyOn(experiments, 'isEnabledAllowingQueryString')
      .mockImplementation(key => key === experiments.NEW_PREVIEW_DOMAIN);
    expect(isPyodideSandboxEnabled()).toBe(true);
  });
});
