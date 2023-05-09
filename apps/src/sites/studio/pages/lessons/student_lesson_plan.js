import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import announcementsReducer, {
  addAnnouncement,
} from '@cdo/apps/code-studio/announcementsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import StudentLessonOverview from '@cdo/apps/templates/lessonOverview/StudentLessonOverview';
import {retrieveProgress} from '@cdo/apps/code-studio/progress';

$(document).ready(function () {
  displayLessonOverview();
  prepareExpandableImageDialog();
});

/**
 * Collect and preprocess all data students should see for the lesson, and
 * render the React component which displays them.
 */
async function displayLessonOverview() {
  const lessonData = getScriptData('lesson');
  const scriptName = getScriptData('scriptName');
  const store = getStore();

  await retrieveProgress(scriptName, null, null);

  if (lessonData.announcements) {
    registerReducers({announcements: announcementsReducer});
    lessonData.announcements.forEach(announcement =>
      store.dispatch(addAnnouncement(announcement))
    );
  }

  ReactDOM.render(
    <Provider store={store}>
      <StudentLessonOverview lesson={lessonData} />
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
