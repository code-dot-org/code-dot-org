import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import ProgrammingExpressionEditor from '@cdo/apps/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';
import reducers, {
  initLevelSearching,
} from '@cdo/apps/levelbuilder/lesson-editor/activitiesEditorRedux';
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

  ReactDOM.render(
    <Provider store={store}>
      <>
        <ProgrammingExpressionEditor
          initialProgrammingExpression={programmingExpression}
          environmentCategories={environmentCategories}
          videoOptions={videoOptions}
        />
        <ExpandableImageDialog />
      </>
    </Provider>,
    document.getElementById('edit-container')
  );
});
