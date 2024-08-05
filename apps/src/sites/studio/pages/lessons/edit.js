import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import reducers, {
  initActivities,
  initLevelSearching,
  initUnitInfo,
  mapActivityDataForEditor,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import programmingExpressionsEditor, {
  initProgrammingExpressions,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import createStandardsReducer, {
  initStandards,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/standardsEditorRedux';
import vocabulariesEditor, {
  initVocabularies,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const lessonData = getScriptData('lesson');
  const relatedLessons = getScriptData('relatedLessons');
  const unitInfo = getScriptData('unitForLesson');
  const levelSearchingInfo = getScriptData('levelSearchingInfo');

  const activities = mapActivityDataForEditor(lessonData.activities);
  const objectives = lessonData.objectives || [];
  const rubric = lessonData.rubric;

  registerReducers({
    ...reducers,
    instructionsDialog: instructionsDialog,
    resources: createResourcesReducer('lessonResource'),
    vocabularies: vocabulariesEditor,
    programmingExpressions: programmingExpressionsEditor,
    standards: createStandardsReducer('standard'),
    opportunityStandards: createStandardsReducer('opportunityStandard'),
  });
  const store = getStore();

  store.dispatch(initActivities(activities));
  store.dispatch(initLevelSearching(levelSearchingInfo));
  store.dispatch(initUnitInfo(unitInfo));
  store.dispatch(initResources('lessonResource', lessonData.resources || []));
  store.dispatch(initVocabularies(lessonData.vocabularies || []));
  store.dispatch(
    initProgrammingExpressions(lessonData.programmingExpressions || [])
  );
  store.dispatch(initStandards('standard', lessonData.standards || []));
  store.dispatch(
    initStandards('opportunityStandard', lessonData.opportunityStandards || [])
  );

  const root = createRoot(document.getElementById('edit-container'));

  root.render(
    <Provider store={store}>
      <div>
        <LessonEditor
          initialObjectives={objectives}
          relatedLessons={relatedLessons}
          initialLessonData={lessonData}
          unitInfo={unitInfo}
          rubricId={rubric ? rubric.id : null}
        />
        <ExpandableImageDialog />
      </div>
    </Provider>
  );
});
