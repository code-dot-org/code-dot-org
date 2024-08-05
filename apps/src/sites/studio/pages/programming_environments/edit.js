import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import ProgrammingEnvironmentEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingEnvironmentEditor';
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
  const root = createRoot(document.getElementById('edit-container'));

  root.render(
    <Provider store={store}>
      <>
        <ProgrammingEnvironmentEditor
          initialProgrammingEnvironment={programmingEnvironment}
        />
        <ExpandableImageDialog />
      </>
    </Provider>
  );
});
