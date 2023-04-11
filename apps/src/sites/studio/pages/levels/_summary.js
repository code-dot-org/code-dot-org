import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import CheckForUnderstanding from '@cdo/apps/templates/levelSummary/CheckForUnderstanding';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';

$(document).ready(() => {
  const store = getStore();
  const scriptData = getScriptData('summary');

  ReactDOM.render(
    <Provider store={store}>
      <InstructorsOnly>
        <CheckForUnderstanding scriptData={scriptData} />
      </InstructorsOnly>
    </Provider>,
    document.getElementById('check-for-understanding')
  );
});
