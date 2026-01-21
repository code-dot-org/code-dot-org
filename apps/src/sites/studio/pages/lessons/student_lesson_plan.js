import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import announcementsReducer, {
  addAnnouncement,
} from '@cdo/apps/code-studio/announcementsRedux';
import {retrieveProgress} from '@cdo/apps/code-studio/progress';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import StudentLessonOverview from '@cdo/apps/templates/lessonOverview/StudentLessonOverview';
import getScriptData from '@cdo/apps/util/getScriptData';

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

  const root = createRoot(document.getElementById('show-container'));

  root.render(<Provider store={store}>
    <StudentLessonOverview lesson={lessonData} />
  </Provider>);
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

  const root = createRoot(container);

  root.render(<Provider store={getStore()}>
    <ExpandableImageDialog />
  </Provider>);
}
