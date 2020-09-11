import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {Provider} from 'react-redux';

//TODO Remove once we hook up real activity data
import {
  activities,
  levelKeyList
} from '../../../../lib/levelbuilder/lesson-editor/ActivitiesEditor.story';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');

  registerReducers({...reducers});
  const store = getStore();
  //TODO Switch to using real data once we have activity data

  store.dispatch(init(activities, levelKeyList));

  ReactDOM.render(
    <Provider store={store}>
      <LessonEditor
        displayName={lessonData.name}
        overview={lessonData.overview}
      />
    </Provider>,
    document.getElementById('edit-container')
  );
});
