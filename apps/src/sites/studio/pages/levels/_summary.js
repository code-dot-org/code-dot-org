import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {UnconnectedPredictSolution} from '@cdo/apps/lab2/views/components/PredictSolution';
import {getStore} from '@cdo/apps/redux';
import SummaryContainer from '@cdo/apps/templates/levelSummary/SummaryContainer.jsx';
import SummaryPredictQuestion from '@cdo/apps/templates/levelSummary/SummaryPredictQuestion';
import SummaryTopLinks from '@cdo/apps/templates/levelSummary/SummaryTopLinks';
//import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
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

  // $('.markdown-container').each(function () {
  //   const container = this;
  //   if (!container.dataset.markdown) {
  //     return;
  //   }

  //   ReactDOM.render(
  //     React.createElement(SafeMarkdown, container.dataset, null),
  //     container
  //   );
  // });

  ReactDOM.render(
    <SummaryContainer
      store={store}
      scriptData={scriptData}
      isLevelGroup={isLevelGroup}
    />,
    document.getElementById('summary-responses')
  );

  // Predict levels are a lab2 feature that replace contained levels.
  if (
    scriptData.viewing_level_data.properties.predict_settings?.isPredictLevel
  ) {
    const predictQuestionContainer =
      document.getElementById('predict-question');
    const correctAnswerContainer = document.getElementById(
      'summary-predict-correct-answer'
    );
    if (predictQuestionContainer) {
      ReactDOM.render(
        <SummaryPredictQuestion
          question={scriptData.viewing_level_data.properties.long_instructions}
          predictSettings={
            scriptData.viewing_level_data.properties.predict_settings
          }
        />,
        predictQuestionContainer
      );
    }

    if (correctAnswerContainer) {
      ReactDOM.render(
        <UnconnectedPredictSolution
          predictSettings={
            scriptData.viewing_level_data.properties.predict_settings
          }
        />,
        correctAnswerContainer
      );
    }
  }
});
