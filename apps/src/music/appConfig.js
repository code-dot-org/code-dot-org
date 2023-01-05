import {queryParams} from '@cdo/apps/code-studio/utils';

export default {
  getValue(name) {
    return queryParams(name);
  }
};
