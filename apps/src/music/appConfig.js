import {queryParams} from '@cdo/apps/code-studio/utils';
import {BlockMode} from './constants';

let setValues = null;

/**
 * Helper function for specifically fetching the 'blocks' config value. Provides
 * a default if an invalid value or no value is found.
 */
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

export function setAppConfig(values) {
  setValues = values;
}

export default {
  getValue(name) {
    if (setValues) {
      return setValues[name];
    } else {
      return queryParams(name);
    }
  }
};
