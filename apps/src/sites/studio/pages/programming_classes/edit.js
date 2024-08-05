import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import ProgrammingClassEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingClassEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerReducers({
    instructionsDialog,
  });
  const store = getStore();

  const programmingClass = getScriptData('programmingClass');
  const environmentCategories = getScriptData('environmentCategories');
  const videoOptions = getScriptData('videoOptions');
  const root = createRoot(document.getElementById('edit-container'));

  root.render(
    <Provider store={store}>
      <>
        <ProgrammingClassEditor
          initialProgrammingClass={programmingClass}
          environmentCategories={environmentCategories}
          videoOptions={videoOptions}
        />
        <ExpandableImageDialog />
      </>
    </Provider>
  );
});
