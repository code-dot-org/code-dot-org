import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {Provider} from 'react-redux';

import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import LessonOverview from '@cdo/apps/templates/lessonOverview/LessonOverview';
import announcementsReducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/announcementsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import {
  setVerified,
  setVerifiedResources
} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';

$(document).ready(function() {
  displayLessonOverview();
  prepareExpandableImageDialog();
  tooltipifyVocabulary();
});

/**
 * Collect and preprocess all data for the lesson and its activities, and
 * render the React component which displays them.
 */
function displayLessonOverview() {
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

      activitySection.duration = activitySection.duration || 0;

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
  registerReducers({isRtl});

  if (lessonData.hasVerifiedResources) {
    store.dispatch(setVerifiedResources());
  }

  if (isTeacher) {
    store.dispatch(setViewType(ViewType.Teacher));

    if (lessonData.isVerifiedTeacher) {
      store.dispatch(setVerified());
    }
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
}

/**
 * Initialize the DOM Element and React Component which serve as containers to
 * display expandable images.
 *
 * @see @cdo/apps/src/templates/utils/expandableImages
 */
function prepareExpandableImageDialog() {
  registerReducers({instructionsDialog});

  const container = document.createElement('div');
  document.body.appendChild(container);

  ReactDOM.render(
    <Provider store={getStore()}>
      <ExpandableImageDialog />
    </Provider>,
    container
  );
}
