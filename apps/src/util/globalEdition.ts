import {Regions} from '@cdo/generated-scripts/globalRegionConstants';
import {GlobalEditionDefaultRegion} from '@cdo/generated-scripts/sharedConstants';

interface RegionConfigurationObject {
  [key: string]: object | boolean;
}

export interface RegionConfigurationPageObject {
  path: string;
  components: RegionConfigurationObject;
}

export interface RegionConfiguration {
  locales?: readonly string[];
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
  Regions[getGlobalEditionRegion() as keyof typeof Regions] ||
  Regions[GlobalEditionDefaultRegion];
