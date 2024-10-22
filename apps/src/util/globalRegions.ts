import {Regions} from '@cdo/generated-scripts/globalRegionConstants';

interface RegionConfigurationObject {
  [key: string]: object | boolean;
}

export interface RegionConfigurationPageObject {
  path: string;
  components: RegionConfigurationObject;
}

export interface RegionConfiguration {
  header?: RegionConfigurationObject;
  footer?: RegionConfigurationObject;
  pages?: readonly RegionConfigurationPageObject[];
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
