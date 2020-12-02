import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonOverview from '@cdo/apps/templates/lessonOverview/LessonOverview';
import announcementsReducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/announcementsRedux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import _ from 'lodash';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  const activities = lessonData['activities'];
  const isTeacher = lessonData['is_teacher'];

  // Rename any keys that are different on the backend.
  activities.forEach(activity => {
    // React key which must be unique for each object in the list.
    activity.key = activity.id + '';

    activity.displayName = activity.name || '';
    delete activity.name;

    activity.duration = activity.duration || 0;

    activity.activitySections.forEach(activitySection => {
      // React key
      activitySection.key = activitySection.id + '';

      activitySection.displayName = activitySection.name || '';
      delete activitySection.name;

      activitySection.text = activitySection.description || '';
      delete activitySection.description;

      activitySection.tips = activitySection.tips || [];
      activitySection.tips.forEach(tip => {
        // React key
        tip.key = _.uniqueId();
      });

      activitySection.scriptLevels.forEach(scriptLevel => {
        // The position within the lesson
        scriptLevel.levelNumber = scriptLevel.position;
        delete scriptLevel.position;
      });
    });
  });

  const store = getStore();

  if (isTeacher) {
    store.dispatch(setViewType(ViewType.Teacher));
  }

  if (lessonData.announcements) {
    registerReducers({announcements: announcementsReducer});
    lessonData.announcements.forEach(announcement =>
      store.dispatch(
        addAnnouncement(
          announcement.notice,
          announcement.details,
          announcement.link,
          announcement.type,
          announcement.visibility
        )
      )
    );
  }

  ReactDOM.render(
    <Provider store={store}>
      <LessonOverview lesson={lessonData} activities={activities} />
    </Provider>,
    document.getElementById('show-container')
  );
});
