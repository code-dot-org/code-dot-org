import getScriptData from '@cdo/apps/util/getScriptData';
import {ProjectType} from '../types';

// Partial definition of the App Options structure, only defining the
// pieces we need in this component.
interface PartialAppOptions {
  channel: string;
  projectType: ProjectType;
}

/**
 * Fetch the ID of the current project from the App Options object
 * if currently on a standalone project level (i.e. under /projects).
 *
 * @returns channel ID if on a standalone project level, null if not.
 *
 * Note: We are trying to use app options as little as possible.
 */
export function getStandaloneProjectId(): string | undefined {
  const appOptions = getScriptData('appoptions') as PartialAppOptions;
  return appOptions.channel;
}

export function getProjectType(): string {
  const appOptions = getScriptData('appoptions') as PartialAppOptions;
  return appOptions.projectType;
}
