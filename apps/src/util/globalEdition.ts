import {get} from 'js-cookie';

import {Regions} from '@cdo/generated-scripts/globalRegionConstants';

interface RegionConfigurationObject {
  [key: string]: object | boolean;
}

export interface RegionConfigurationPageObject {
  path: string;
  components: RegionConfigurationObject;
}

export interface RegionConfiguration {
  locales?: readonly string[];
  locale_lock?: boolean;
  countries?: readonly string[];
  header?: RegionConfigurationObject;
  footer?: RegionConfigurationObject;
  pages?: readonly RegionConfigurationPageObject[];
}

/**
 * This returns the current region, if known, the current page is rendered
 * within. This uses the current location, so it only returns a global region
 * name when you are in a page that is inside the /global/<name> context.
 */
export const getGlobalEditionRegionFromLocation: () => string = () =>
  window.location.pathname.match(/^\/global\/(fa)/)?.[1] || 'root';

/**
 * This returns the current region while allowing for a script data override.
 */
export const getGlobalEditionRegion = () => {
  const geRegionScript = document.querySelector(
    'script[data-ge-region]'
  ) as HTMLScriptElement;

  const geRegion = geRegionScript
    ? geRegionScript.dataset.geRegion
    : get('ge_region');

  return geRegion || getGlobalEditionRegionFromLocation();
};

/**
 * This returns the current region's configuration data.
 */
export const currentGlobalConfiguration: () => RegionConfiguration = () =>
  (Regions as {[key: string]: RegionConfiguration})[getGlobalEditionRegion()] ||
  {};
