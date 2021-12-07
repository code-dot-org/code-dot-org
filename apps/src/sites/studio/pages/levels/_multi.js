import {getStore} from '@cdo/apps/code-studio/redux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';

import Multi from '@cdo/apps/code-studio/levels/multi';
window.Multi = Multi;

$(function() {
  const data = getScriptData('multi');

  const store = getStore();

  if (data.is_instructor || data.is_instructor_in_training) {
    store.dispatch(setViewType(ViewType.Instructor));
  }
});
