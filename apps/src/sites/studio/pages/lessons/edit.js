import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init,
  mapActivityDataForEditor
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import resourcesEditor, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import vocabulariesEditor, {
  initVocabularies
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {Provider} from 'react-redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';

$(document).ready(function() {
  displayLessonEdit();
  prepareExpandableImageDialog();
});

function displayLessonEdit() {
  const lessonData = getScriptData('lesson');
  const relatedLessons = getScriptData('relatedLessons');
  const searchOptions = getScriptData('searchOptions');

  const activities = mapActivityDataForEditor(lessonData.activities);
  const objectives = lessonData.objectives || [];

  registerReducers({
    ...reducers,
    resources: resourcesEditor,
    vocabularies: vocabulariesEditor
  });
  const store = getStore();

  store.dispatch(init(activities, searchOptions));
  store.dispatch(initResources(lessonData.resources || []));
  store.dispatch(initVocabularies(lessonData.vocabularies || []));

  ReactDOM.render(
    <Provider store={store}>
      <LessonEditor
        initialObjectives={objectives}
        relatedLessons={relatedLessons}
        initialLessonData={lessonData}
      />
    </Provider>,
    document.getElementById('edit-container')
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
