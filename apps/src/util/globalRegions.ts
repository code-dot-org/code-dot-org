import {Regions} from '@cdo/generated-scripts/globalRegionConstants';

/**
 * This returns the current region, if known, the current page is rendered
 * within. This uses the current location, so it only returns a global region
 * name when you are in a page that is inside the /global/<name> context.
 */
export const currentGlobalRegion: () => string = () =>
  window.location.pathname.match(/^\/global\/(fa)/)?.[1] || '';

/**
 * This returns the current region's configuration data.
 */
export const currentGlobalConfiguration: () => object = () =>
  (Regions as {[key: string]: unknown})[currentGlobalRegion()] || {};

/**
 * This queries the global configuration for the given key
 */
export const currentGlobalConfigurationFor: (key: string) => object = key => {
  // Split by '.' and then tap into the object
  const parts = key.split('.');
  let context: unknown = currentGlobalConfiguration();
  for (const part of parts) {
    if (context[part] === false) {
      context = false;
      break;
    }
    context = context[part] || {};
  }

  // Handle 'false' as falsey and an empty object as truth
  // This would handle a component that is there, but with no extra properties
  if (context !== false && Object.keys(context).length === 0) {
    context = true;
  }

  return !!context;
};
