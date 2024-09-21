import {Regions} from '@cdo/generated-scripts/globalRegionConstants';

interface RegionConfigurationObject {
  [key: string]: object | boolean;
}

interface RegionConfigurationPageObject {
  [key: string]: RegionConfigurationObject;
}

export interface RegionConfiguration {
  header?: RegionConfigurationObject;
  footer?: RegionConfigurationObject;
  pages?: RegionConfigurationPageObject;
}

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
export const currentGlobalConfiguration: () => RegionConfiguration = () =>
  (Regions as {[key: string]: RegionConfiguration})[currentGlobalRegion()] ||
  {};

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
export const currentGlobalConfigurationFor: (
  key: string
) => object | boolean = key => {
  // Split by '.' and then tap into the object
  const parts = key.split('.');
  let context: object | boolean = currentGlobalConfiguration() as
    | object
    | boolean;
  for (const part of parts) {
    if ((context as {[key: string]: object | boolean})[part] === false) {
      context = false;
      break;
    }
    context = (context as {[key: string]: object | boolean})[part] || {};
  }

  // Handle 'false' as falsey and an empty object as truth
  // This would handle a component that is there, but with no extra properties
  if (context !== false && Object.keys(context).length === 0) {
    context = true;
  }

  return !!context;
};

/**
 * This wraps a component such that it updates its own properties to
 * override them with the ones found in the global configuration.
 *
 * @param {React.FunctionComponent} WrappedComponent - The component to wrap.
 * @param {string} componentId - The name of this component.
 */
export const globalRegionWrapper: (
  WrappedComponent: React.FunctionComponent,
  componentId: string
) => React.FunctionComponent = (WrappedComponent, componentId) => {
  const EmptyComponent = () => null;

  const pages = currentGlobalConfiguration().pages || {};

  // Retrieves the current page Global Region config based on the page path mask.
  const pageConfigKey: string | undefined = (
    Object.keys(pages) as Array<string>
  ).find(pageMask => RegExp(pageMask).test(window.location.pathname));

  if (pageConfigKey) {
    const pageConfig = pages[pageConfigKey];

    // Renders the component if it is enabled for the page
    return !pageConfig || pageConfig[componentId]
      ? WrappedComponent
      : EmptyComponent;
  }

  // Just output the unaltered component if there's no rule
  return WrappedComponent;
};
