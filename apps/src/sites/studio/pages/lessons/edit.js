import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init,
  mapActivityDataForEditor
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import createResourcesReducer, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import createStandardsReducer, {
  initStandards
} from '@cdo/apps/lib/levelbuilder/lesson-editor/standardsEditorRedux';
import vocabulariesEditor, {
  initVocabularies
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import programmingExpressionsEditor, {
  initProgrammingExpressions
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
    resources: createResourcesReducer('lessonResource'),
    vocabularies: vocabulariesEditor,
    programmingExpressions: programmingExpressionsEditor,
    standards: createStandardsReducer('standard'),
    opportunityStandards: createStandardsReducer('opportunityStandard')
  });
  const store = getStore();

  store.dispatch(
    init(
      activities,
      searchOptions,
      lessonData.programmingEnvironments,
      lessonData.lessonExtrasAvailableForScript
    )
  );
  store.dispatch(initResources('lessonResource', lessonData.resources || []));
  store.dispatch(initVocabularies(lessonData.vocabularies || []));
  store.dispatch(
    initProgrammingExpressions(lessonData.programmingExpressions || [])
  );
  store.dispatch(initStandards('standard', lessonData.standards || []));
  store.dispatch(
    initStandards('opportunityStandard', lessonData.opportunityStandards || [])
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
