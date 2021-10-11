import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ProgrammingExpressionOverview from '@cdo/apps/templates/codeDocs/ProgrammingExpressionOverview';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

$(document).ready(() => {
  registerReducers({
    instructionsDialog
  });
  const store = getStore();

  const programmingExpression = getScriptData('programmingExpression');
  ReactDOM.render(
    <Provider store={store}>
      <>
        <ProgrammingExpressionOverview
          programmingExpression={programmingExpression}
        />
        <ExpandableImageDialog />
      </>
    </Provider>,
    document.getElementById('show-container')
  );
});
