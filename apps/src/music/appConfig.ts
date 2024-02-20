import {queryParams} from '@cdo/apps/code-studio/utils';
import {BlockMode} from './constants';
import {baseAssetUrl} from './constants';

type ConfigValues = {[key: string]: string};

// Static config values passed in via a call to setAppConfig.
// If these are set, we ignore URL parameters.
let configValues: ConfigValues | null = null;

// Called to set config values.
export function setAppConfig(values: ConfigValues) {
  configValues = values;
}

// Helper function for specifically fetching the 'blocks' config value. Provides
// a default if an invalid value or no value is found.
export const getBlockMode = () => {
  const defaultMode = BlockMode.SIMPLE2;

  let blockMode = (queryParams('blocks') as string) || defaultMode;
  blockMode = blockMode.replace(/^./, str => str.toUpperCase()); // Capitalize first letter if necessary

  if (!Object.values(BlockMode).includes(blockMode)) {
    console.warn(
      `Invalid block mode: ${blockMode}. Falling back to default (${defaultMode})`
    );
    blockMode = defaultMode;
  }

  return blockMode;
};

export const getBaseAssetUrl = (): string => {
  const url = queryParams('base-asset-url') as string;
  if (url) {
    return url + '/';
  } else {
    return baseAssetUrl;
  }
};

export default {
  // Returns a config value.
  getValue(name: string) {
    if (configValues) {
      return configValues[name];
    } else {
      return queryParams(name);
    }
  },
};
