import type {PartialAppOptions} from '../types';
export * from './queryParams';
export * from './fetchSignedCookies';

function currentLocale(): string {
  return 'en';
}

function getScriptData(name: string): object {
  name = name.toLowerCase();
  const script = document.querySelector<HTMLScriptElement>(`script[data-${name}]`);
  try {
    return JSON.parse(script?.dataset?.[name] || '{}');
  } catch (e) {
    console.error('Failed to parse script data for script', name);
    throw e;
  }
}

function hasScriptData(name: string): boolean {
  return !!document.querySelector(name);
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
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.channel;
  }
}

/**
 * Returns the level ID provided by App Options, if available.
 * This is specifically used in scenarios where the level ID is not provided
 * by other means (for example via header.js)
 */
export function getAppOptionsLevelId(): number | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.levelId;
  }
}

/**
 * Returns the edit mode provided by App Options, if available.
 * This can be used to tell if we are a levelbuilder mode (e.g. start_sources)
 */
export function getAppOptionsEditBlocks(): string | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.editBlocks;
  }
}

/**
 * Returns the value of isEditingExemplar provided by App Options, if available.
 * This can be used to tell if we are currently editing exemplars.
 */
export function getAppOptionsEditingExemplar(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.isEditingExemplar;
  }
}

/**
 * Returns the value of isViewingExemplar provided by App Options, if available.
 * This can be used to tell if we are currently viewing exemplars.
 */
export function getAppOptionsViewingExemplar(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.isViewingExemplar;
  }
}

export function getAppOptionsTheme(): string | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.theme;
  }
}

/**
 * Returns if the lab should presented in a share/play-only view,
 * if present in App Options. Only used in standalone project levels.
 */
export function getIsShareView(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.share;
  }
}

/**
 * Fetch whether the page is cached.
 *
 * @returns true if the page is cached.
 */
export function getPublicCaching(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.publicCaching;
  }
}

/**
 * Returns the value of the language cookie (eg, en-US, which is also the default if the cookie is not set).
 */
export function getCurrentLocale(): string {
  return currentLocale();
}

/**
 * Takes a simple object and returns it represented as a chain of url query
 * params, including ? and & as necessary. Does not perform escaping. Examples:
 * {} -> ''
 * {a: 1} -> '?a=1'
 * {a: 1, b: 'c'} -> '?a=1&b=c'
 *
 * @param params - Object to stringify.
 * @return A query parameter string.
 */
export const stringifyQueryParams: (params?: Record<string, string>) => string = params => {
  if (!params) {
    return '';
  }
  const keys = Object.keys(params) as string[];
  if (!keys.length) {
    return '';
  }
  return '?' + keys.map(key => `${key}=${params[key]}`).join('&');
}
