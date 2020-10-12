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

//TODO Remove once we hook up real level data
import {levelKeyList} from '../../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  const activities = lessonData.activities;

  // Rename any keys that are different on the backend.
  activities.forEach(activity => {
    // React key which must be unique for each object in the list. React
    // recommends against using the array index for this. We don't want to use
    // the id column directly, because when we create new objects, we want to
    // be able specify a react key while leaving the id field blank.
    //
    // This is a quirk due to the fact that we are not actually posting to the
    // server to get a new object id at the time a new object is created in the
    // UI. If we start doing that, then we should be able to get into a state
    // where every object has an id, and this key field should become unneeded.
    activity.key = activity.id + '';

    activity.displayName = activity.name;
    delete activity.name;

    activity.activitySections.forEach(activitySection => {
      // React key
      activitySection.key = activitySection.id + '';

      activitySection.displayName = activitySection.name;
      delete activitySection.name;

      activitySection.text = activitySection.description || '';
      delete activitySection.description;

      activitySection.scriptLevels = activitySection.levels || [];

      activitySection.tips = activitySection.tips || [];

      activitySection.tips.forEach(tip => {
        // React key
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
