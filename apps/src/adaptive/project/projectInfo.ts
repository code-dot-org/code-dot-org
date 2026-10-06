import {Channel} from '@cdo/apps/lab2/types';

import {PathwayProjectInfo} from '../types';

/** The project's name and description as the student set them on its channel. */
export function projectInfoFromChannel(
  channel: Channel | undefined
): PathwayProjectInfo {
  return {
    name: channel?.name || undefined,
    description: channel?.labConfig?.adaptive?.description,
  };
}
