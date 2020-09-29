import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {Provider} from 'react-redux';
import _ from 'lodash';

//TODO Remove once we hook up real activity data
import {levelKeyList} from '@cdo/apps/lib/levelbuilder/lesson-editor/SampleActivitiesData';

$(document).ready(function() {
  const lessonData = getScriptData('lesson').editableData;
  const activities = lessonData.activities;

  // Rename any keys that are different on the frontend.
  activities.forEach(activity => {
    activity.key = activity.id + '';

    activity.displayName = activity.name;
    delete activity.name;

    activity.activitySections.forEach(activitySection => {
      activitySection.key = activitySection.id + '';

      activitySection.displayName = activitySection.name;
      delete activitySection.name;

      activitySection.text = activitySection.description;
      delete activitySection.description;

      activitySection.levels = activitySection.levels || [];

      activitySection.tips = activitySection.tips || [];

      activitySection.tips.forEach(tip => {
        tip.key = _.uniqueId();
      });
    });
  });

  registerReducers({...reducers});
  const store = getStore();

  //TODO Switch to using real data once we have activity data
  store.dispatch(init(activities, levelKeyList));

  ReactDOM.render(
    <Provider store={store}>
      <LessonEditor
        displayName={lessonData.name}
        overview={lessonData.overview}
        studentOverview={lessonData.studentOverview}
        unplugged={lessonData.unplugged}
        lockable={lessonData.lockable}
        creativeCommonsLicense={lessonData.creativeCommonsLicense}
        assessment={lessonData.assessment}
        purpose={lessonData.purpose}
        preparation={lessonData.preparation}
        announcements={lessonData.announcements || []}
      />
    </Provider>,
    document.getElementById('edit-container')
  );
});
