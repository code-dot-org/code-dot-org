import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ProgrammingMethodEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingMethodEditor';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

$(document).ready(() => {
  registerReducers({
    instructionsDialog,
  });
  const store = getStore();

  const programmingMethod = getScriptData('programmingMethod');
  const overloadOptions = getScriptData('overloadOptions');
  ReactDOM.render(
    <Provider store={store}>
      <>
        <ProgrammingMethodEditor
          initialProgrammingMethod={programmingMethod}
          overloadOptions={overloadOptions}
        />
        <ExpandableImageDialog />
      </>
    </Provider>,
    document.getElementById('edit-container')
  );
});
