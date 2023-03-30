import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import CheckForUnderstanding from '@cdo/apps/templates/levelSummary/CheckForUnderstanding';
import {Provider} from 'react-redux';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {getStore} from '@cdo/apps/redux';

$(document).ready(() => {
  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <InstructorsOnly>
        <CheckForUnderstanding />
      </InstructorsOnly>
    </Provider>,
    document.getElementById('check-for-understanding')
  );
});
