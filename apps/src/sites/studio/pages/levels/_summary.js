import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {UnconnectedPredictSolution} from '@cdo/apps/lab2/views/components/PredictSolution';
import {getStore} from '@cdo/apps/redux';
import SummaryPredictQuestion from '@cdo/apps/templates/levelSummary/SummaryPredictQuestion';
import SummaryResponses from '@cdo/apps/templates/levelSummary/SummaryResponses';
import SummaryTeacherInstructions from '@cdo/apps/templates/levelSummary/SummaryTeacherInstructions';
import SummaryTopLinks from '@cdo/apps/templates/levelSummary/SummaryTopLinks';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import getScriptData from '@cdo/apps/util/getScriptData';

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

  // Predict levels are a lab2 feature that replace contained levels.
  if (scriptData.level.properties.predict_settings?.isPredictLevel) {
    const predictQuestionContainer =
      document.getElementById('predict-question');
    const correctAnswerContainer = document.getElementById(
      'summary-predict-correct-answer'
    );
    if (predictQuestionContainer) {
      ReactDOM.render(
        <SummaryPredictQuestion
          question={scriptData.level.properties.long_instructions}
          predictSettings={scriptData.level.properties.predict_settings}
        />,
        predictQuestionContainer
      );
    }

    if (correctAnswerContainer) {
      ReactDOM.render(
        <UnconnectedPredictSolution
          predictSettings={scriptData.level.properties.predict_settings}
        />,
        correctAnswerContainer
      );
    }
  }
});
