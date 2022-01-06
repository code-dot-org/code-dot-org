import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ProgrammingEnvironmentEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingEnvironmentEditor';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

$(document).ready(() => {
  // instructionsDialog reducer is needed for the ExpandableImageDialog
  registerReducers({
    instructionsDialog
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
