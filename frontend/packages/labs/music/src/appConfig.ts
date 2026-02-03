import {utils} from '@code-dot-org/lab';

import {baseAssetUrl} from './constants';

export const getBaseAssetUrl = (): string => {
  const url = utils.queryParams('base-asset-url') as string | undefined;
  if (url) {
    return url + '/';
  } else {
    return baseAssetUrl;
  }
};

export default {
  // Returns a config value.
  getValue(name: string): string | undefined {
    return utils.queryParams(name) as string | undefined;
  },
};
