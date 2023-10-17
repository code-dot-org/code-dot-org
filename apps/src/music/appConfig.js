import {queryParams} from '@cdo/apps/code-studio/utils';
import {BlockMode} from './constants';

// Static config values passed in via a call to setAppConfig.
// If these are set, we ignore URL parameters.
let configValues = null;

// Called to set config values.
export function setAppConfig(values) {
  configValues = values;
}

// Helper function for specifically fetching the 'blocks' config value. Provides
// a default if an invalid value or no value is found.
export const getBlockMode = () => {
  const defaultMode = BlockMode.SIMPLE2;

  let blockMode = queryParams('blocks') || defaultMode;
  blockMode = blockMode.replace(/^./, str => str.toUpperCase()); // Capitalize first letter if necessary

  if (!Object.values(BlockMode).includes(blockMode)) {
    console.warn(
      `Invalid block mode: ${blockMode}. Falling back to default (${defaultMode})`
    );
    blockMode = defaultMode;
  }

  return blockMode;
};

export default {
  // Returns a config value.
  getValue(name) {
    if (configValues) {
      return configValues[name];
    } else {
      return queryParams(name);
    }
  },
};
