import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import ProgrammingExpressionEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';
import reducers, {
  initLevelSearching,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerReducers({
    ...reducers,
    instructionsDialog,
  });
  const store = getStore();

  const programmingExpression = getScriptData('programmingExpression');
  const environmentCategories = getScriptData('environmentCategories');
  const videoOptions = getScriptData('videoOptions');
  const levelSearchingInfo = getScriptData('levelSearchingInfo');
  store.dispatch(initLevelSearching(levelSearchingInfo));

  const root = createRoot(document.getElementById('edit-container'));

  root.render(
    <Provider store={store}>
      <>
        <ProgrammingExpressionEditor
          initialProgrammingExpression={programmingExpression}
          environmentCategories={environmentCategories}
          videoOptions={videoOptions}
        />
        <ExpandableImageDialog />
      </>
    </Provider>
  );
});
