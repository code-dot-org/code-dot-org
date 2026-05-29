import {MiniApps} from '@codebridge/constants';

import {deriveLabConfig} from '@cdo/apps/javalab/lab2/labConfig';
import {LabConfig} from '@cdo/apps/lab2/types';

describe('javalab2 deriveLabConfig', () => {
  it('derives a neighborhood miniApp from csaViewMode when no channel config', () => {
    expect(deriveLabConfig('neighborhood', undefined)).toEqual({
      miniApp: {name: MiniApps.Neighborhood},
    });
  });

  it('returns the channel labConfig verbatim, taking precedence over csaViewMode', () => {
    const channelLabConfig: LabConfig = {miniApp: {name: 'something-else'}};
    expect(deriveLabConfig('neighborhood', channelLabConfig)).toBe(
      channelLabConfig
    );
    // Even a non-neighborhood csaViewMode yields the stored channel config.
    expect(deriveLabConfig('console', channelLabConfig)).toBe(channelLabConfig);
  });

  it('returns undefined for non-neighborhood modes with no channel config', () => {
    expect(deriveLabConfig('console', undefined)).toBeUndefined();
    expect(deriveLabConfig('theater', undefined)).toBeUndefined();
    expect(deriveLabConfig(undefined, undefined)).toBeUndefined();
  });
});
