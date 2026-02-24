import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {getStore} from '@cdo/apps/redux';
import SummaryEntryPoint from '@cdo/apps/templates/levelSummary/SummaryEntryPoint';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  $('#summaryEntryPoint').each(function () {
    const container = this;
    const store = getStore();

    createReactRoot(
      <Provider store={store}>
        <InstructorsOnly>
          <SummaryEntryPoint scriptData={getScriptData('summaryinfo')} />
        </InstructorsOnly>
      </Provider>,
      container
    );
  });
});
