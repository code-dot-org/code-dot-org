import getScriptData from '@cdo/apps/util/getScriptData';

// Partial definition of the App Options structure, only defining the
// pieces we need in this component.
interface PartialAppOptions {
  level: {
    isProjectLevel: boolean;
  };
  channel: string;
}

/**
 * Fetch the ID of the current project from the App Options object
 * if currently on a standalone project level (i.e. under /projects).
 *
 * @returns channel ID if on a standalone project level, null if not.
 *
 * Note: We are trying to use app options as little as possible.
 * TODO: We should determine the value if 'isProjectLevel' from the level definition.
 * We will still need to read channel ID from the app options object, but
 * longer term, we may rework how this information is served from the backend.
 */
export function getStandaloneProjectId(): string | null {
  const appOptions = getScriptData('appoptions') as PartialAppOptions;
  if (appOptions.level?.isProjectLevel && appOptions.channel) {
    return appOptions.channel;
  }

  return null;
}
