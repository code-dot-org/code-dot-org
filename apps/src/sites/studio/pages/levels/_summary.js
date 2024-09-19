import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {getStore} from '@cdo/apps/redux';
import SummaryContainer from '@cdo/apps/templates/levelSummary/SummaryContainer.jsx';
import SummaryTopLinks from '@cdo/apps/templates/levelSummary/SummaryTopLinks';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const store = getStore();
  const scriptData = getScriptData('summary');

  const isLevelGroup = scriptData.in_level_group;

  ReactDOM.render(
    <Provider store={store}>
      <InstructorsOnly>
        <SummaryTopLinks scriptData={scriptData} />
      </InstructorsOnly>
    </Provider>,
    document.getElementById('summary-top-links')
  );

  $('.markdown-container').each(function () {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    ReactDOM.render(
      React.createElement(SafeMarkdown, container.dataset, null),
      container
    );
  });

  ReactDOM.render(
    <SummaryContainer
      store={store}
      scriptData={scriptData}
      isLevelGroup={isLevelGroup}
    />,
    document.getElementById('summary-responses')
  );
});
