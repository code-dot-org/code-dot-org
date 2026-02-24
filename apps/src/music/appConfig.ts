import {queryParams} from '@cdo/apps/code-studio/utils';

import {baseAssetUrl} from './constants';

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
