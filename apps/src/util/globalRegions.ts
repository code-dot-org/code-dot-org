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
 * This queries the current global configuration for the given key.
 *
 * For instance, if our region config has:
 *
 * ```
 * teacher-homepage:
 *   incubator-banner: false
 * ```
 *
 * We can get "false" back by calling this function as:
 *
 * ```
 * currentGlobalConfigurationFor("teacherHomepage.incubatorBanner")
 * ```
 *
 * If it is something more complicated:
 *
 * ```
 * teacher-homepage:
 *   header-image:
 *     src: "/images/farsi-header.png"
 * ```
 *
 * Then, calling the function with `teacherHomepage.headerImage` will give you
 * the object inside. In this case: `{src: "/images/farsi-header.png"}`.
 *
 * If `false` is the value, the function will always return a false-y result,
 * and otherwise will always return a true-y result.
 *
 * @param {string} key - The '.'-delimited key to read from the region configuration.
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
