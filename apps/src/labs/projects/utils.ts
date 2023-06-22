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
 */
export function getStandaloneProjectId(): string | null {
  const appOptions = getScriptData('appoptions') as PartialAppOptions;
  if (appOptions.level?.isProjectLevel && appOptions.channel) {
    return appOptions.channel;
  }

  return null;
}
