import {MiniApps} from '@codebridge/constants';

import {LabConfig} from '@cdo/apps/lab2/types';

import {CsaViewMode} from './types';

// Java Lab's flat S3 source can't carry a labConfig (it must stay in the legacy
// {filename: {...}} shape Javabuilder reads), so labConfig lives on the channel.
// The channel is the source of truth on load; fall back to deriving from the
// level's csaViewMode, which covers new projects and student/authoring views
// where the channel has not yet been written.
export function deriveLabConfig(
  csaViewMode: CsaViewMode | undefined,
  channelLabConfig: LabConfig | undefined
): LabConfig | undefined {
  if (channelLabConfig) {
    return channelLabConfig;
  }
  if (csaViewMode === 'neighborhood') {
    return {miniApp: {name: MiniApps.Neighborhood}};
  }
  return undefined;
}
