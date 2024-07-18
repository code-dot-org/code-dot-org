import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import ProgrammingMethodEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingMethodEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerReducers({
    instructionsDialog,
  });
  const store = getStore();

  const programmingMethod = getScriptData('programmingMethod');
  const overloadOptions = getScriptData('overloadOptions');
  const root = createRoot(document.getElementById('edit-container'));

  root.render(
    <Provider store={store}>
      <>
        <ProgrammingMethodEditor
          initialProgrammingMethod={programmingMethod}
          overloadOptions={overloadOptions}
        />
        <ExpandableImageDialog />
      </>
    </Provider>
  );
});
