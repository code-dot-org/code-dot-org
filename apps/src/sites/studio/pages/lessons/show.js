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
} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';
import CloneLessonDialogButton from '@cdo/apps/lib/levelbuilder/CloneLessonDialogButton';
import {
  setUserRoleInCourse,
  CourseRoles
} from '@cdo/apps/templates/currentUserRedux';

$(document).ready(function() {
  prepareBlockly();
  displayLessonOverview();
  prepareExpandableImageDialog();
  tooltipifyVocabulary();
  renderCopyLessonButton();
});

function prepareBlockly() {
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (!customBlocksConfig) {
    return;
  }
  prepareBlocklyForEmbedding(customBlocksConfig);
}

/**
 * Collect and preprocess all data for the lesson and its activities, and
 * render the React component which displays them.
 */
function displayLessonOverview() {
  const lessonData = getScriptData('lesson');
  const activities = lessonData['activities'];
  const isInstructor = lessonData['is_instructor'];

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

  if (isInstructor) {
    store.dispatch(setViewType(ViewType.Instructor));
    store.dispatch(setUserRoleInCourse(CourseRoles.Instructor));

    if (lessonData.isVerifiedInstructor) {
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

const renderCopyLessonButton = () => {
  const element = document.getElementById('copy-lesson-button');

  // this will only be present for levelbuilders, in the extra links box
  if (element) {
    const lessonData = getScriptData('lesson');
    const lessonId = lessonData['id'];
    const lessonName = lessonData['displayName'];

    ReactDOM.render(
      <CloneLessonDialogButton
        lessonId={lessonId}
        lessonName={lessonName}
        buttonText="Copy"
      />,
      element
    );
  }
};
