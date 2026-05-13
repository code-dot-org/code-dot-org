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
 * This returns the current GE region code.
 */
export const getGlobalEditionRegion = () =>
  document.documentElement.dataset.geRegion || null;

/**
 * This returns the current region's configuration data.
 */
export const currentGlobalConfiguration: () => RegionConfiguration = () =>
  Regions[getGlobalEditionRegion() as keyof typeof Regions] || Regions.root;
