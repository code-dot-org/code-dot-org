import {getStore} from '@cdo/apps/code-studio/redux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';

import TextMatch from '@cdo/apps/code-studio/levels/textMatch';
window.TextMatch = TextMatch;

$(function() {
  const data = getScriptData('textmatch');

  const store = getStore();

  if (data.is_instructor || data.is_instructor_in_training) {
    store.dispatch(setViewType(ViewType.Instructor));
  }
});
