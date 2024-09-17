import {queryParams} from '@cdo/apps/code-studio/utils';

import {ValueOf} from '../types/utils';

import {BlockMode, baseAssetUrl} from './constants';

// Helper function for specifically fetching the 'blocks' config value. Provides
// a default if an invalid value or no value is found.
export const getBlockMode = () => {
  const defaultMode = BlockMode.SIMPLE2;

  let blockMode = (queryParams('blocks') as string) || defaultMode;
  blockMode = blockMode.replace(/^./, str => str.toUpperCase()); // Capitalize first letter if necessary

  if (!(Object.values(BlockMode) as string[]).includes(blockMode)) {
    console.warn(
      `Invalid block mode: ${blockMode}. Falling back to default (${defaultMode})`
    );
    blockMode = defaultMode;
  }

  return blockMode as ValueOf<typeof BlockMode>;
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
    return queryParams(name);
  },
};
