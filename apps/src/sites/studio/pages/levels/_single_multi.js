import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {getStore} from '@cdo/apps/redux';
import SummaryEntryPoint from '@cdo/apps/templates/levelSummary/SummaryEntryPoint';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  $('#summaryEntryPoint').each(function () {
    const container = this;
    const store = getStore();

    ReactDOM.render(
      <Provider store={store}>
        <InstructorsOnly>
          <SummaryEntryPoint scriptData={getScriptData('summaryinfo')} />
        </InstructorsOnly>
      </Provider>,
      container
    );
  });
});
