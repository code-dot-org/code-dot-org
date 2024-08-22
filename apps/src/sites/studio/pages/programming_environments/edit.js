import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import ProgrammingEnvironmentEditor from '@cdo/apps/levelbuilder/code-docs-editor/ProgrammingEnvironmentEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  // instructionsDialog reducer is needed for the ExpandableImageDialog
  registerReducers({
    instructionsDialog,
  });
  const store = getStore();

  const programmingEnvironment = getScriptData('programmingEnvironment');
  ReactDOM.render(
    <Provider store={store}>
      <>
        <ProgrammingEnvironmentEditor
          initialProgrammingEnvironment={programmingEnvironment}
        />
        <ExpandableImageDialog />
      </>
    </Provider>,
    document.getElementById('edit-container')
  );
});
