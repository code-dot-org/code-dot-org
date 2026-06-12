import {LabConfig} from '@cdo/apps/lab2/types';

import {CsaViewMode} from './types';

// Java Lab's flat S3 source can't carry a labConfig (it must stay in the legacy
// {filename: {...}} shape Javabuilder reads), so labConfig lives on the channel.
// The channel is the source of truth on load; fall back to deriving from the
// level's csaViewMode.
export function deriveLabConfig(
  csaViewMode: CsaViewMode | undefined,
  channelLabConfig: LabConfig | undefined
): LabConfig | undefined {
  if (channelLabConfig) {
    return channelLabConfig;
  }
  if (csaViewMode && csaViewMode !== 'console') {
    return {miniApp: {name: csaViewMode}};
  }
  return undefined;
}
