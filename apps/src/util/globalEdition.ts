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
 * This returns the current region while allowing for a script data override.
 */
export const getGlobalEditionRegion = () => {
  const geRegionScript = document.querySelector(
    'script[data-ge-region]'
  ) as HTMLScriptElement;

  return geRegionScript?.dataset?.geRegion;
};

/**
 * This returns the current region's configuration data.
 */
export const currentGlobalConfiguration: () => RegionConfiguration = () =>
  Regions[getGlobalEditionRegion() as keyof typeof Regions] || Regions.root;
