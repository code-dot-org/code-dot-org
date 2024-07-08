import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SummaryTopLinks from '@cdo/apps/templates/levelSummary/SummaryTopLinks';
import SummaryResponses from '@cdo/apps/templates/levelSummary/SummaryResponses';
import SummaryTeacherInstructions from '@cdo/apps/templates/levelSummary/SummaryTeacherInstructions';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {UnconnectedPredictSolution} from '@cdo/apps/lab2/views/components/PredictSolution';
import SummaryPredictQuestion from '@cdo/apps/templates/levelSummary/SummaryPredictQuestion';

$(document).ready(() => {
  const store = getStore();
  const scriptData = getScriptData('summary');

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
    <Provider store={store}>
      <InstructorsOnly>
        <SummaryResponses scriptData={scriptData} />
      </InstructorsOnly>
    </Provider>,
    document.getElementById('summary-responses')
  );

  ReactDOM.render(
    <SummaryTeacherInstructions scriptData={scriptData} />,
    document.getElementById('summary-teacher-instructions')
  );

  if (scriptData.level.properties.predict_settings?.isPredictLevel) {
    ReactDOM.render(
      <SummaryPredictQuestion
        question={scriptData.level.properties.long_instructions}
        predictSettings={scriptData.level.properties.predict_settings}
      />,
      document.getElementById('predict-question')
    );

    ReactDOM.render(
      <UnconnectedPredictSolution
        predictSettings={scriptData.level.properties.predict_settings}
      />,
      document.getElementById('summary-correct-answer')
    );
  }
});
