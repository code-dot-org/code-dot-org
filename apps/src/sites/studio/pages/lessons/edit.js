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
import programmingExpressionsEditor, {
  initprogrammingExpressions
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';
import {Provider} from 'react-redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  const relatedLessons = getScriptData('relatedLessons');
  const searchOptions = getScriptData('searchOptions');

  const activities = mapActivityDataForEditor(lessonData.activities);
  const objectives = lessonData.objectives || [];

  registerReducers({
    ...reducers,
    instructionsDialog: instructionsDialog,
    resources: resourcesEditor,
    vocabularies: vocabulariesEditor,
    programmingExpressions: programmingExpressionsEditor
  });
  const store = getStore();

  store.dispatch(init(activities, searchOptions));
  store.dispatch(initResources(lessonData.resources || []));
  store.dispatch(initVocabularies(lessonData.vocabularies || []));
  store.dispatch(
    initprogrammingExpressions(lessonData.programmingExpressions || [])
  );

  ReactDOM.render(
    <Provider store={store}>
      <div>
        <LessonEditor
          initialObjectives={objectives}
          relatedLessons={relatedLessons}
          initialLessonData={lessonData}
        />
        <ExpandableImageDialog />
      </div>
    </Provider>,
    document.getElementById('edit-container')
  );
});
