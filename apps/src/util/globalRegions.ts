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
  window.location.pathname.match(/^\/global\/(fa)/)?.[1] || 'root';

/**
 * This returns the current region's configuration data.
 */
export const currentGlobalConfiguration: () => RegionConfiguration = () =>
  (Regions as {[key: string]: RegionConfiguration})[currentGlobalRegion()] ||
  {};

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
