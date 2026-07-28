import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';

export function resolveAppLabImagePath(url) {
  return ABSOLUTE_REGEXP.test(url) ? url : assetPrefix.fixPath(url);
}
