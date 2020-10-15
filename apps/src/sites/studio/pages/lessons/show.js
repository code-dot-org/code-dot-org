import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonOverview from '@cdo/apps/templates/lessonOverview/LessonOverview';
import {sampleActivities} from '../../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';
import announcementsReducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/announcementsRedux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');

  const store = getStore();

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
      <LessonOverview
        lesson={lessonData}
        activities={sampleActivities} //TODO: Get real activities data getting passed here
      />
    </Provider>,
    document.getElementById('show-container')
  );
});
