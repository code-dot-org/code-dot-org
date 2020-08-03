import React from 'react';
import ReactDOM from 'react-dom';
import QuestionView from '../../../../code-studio/components/QuestionView';
import {Provider} from 'react-redux/src';
import {getStore, registerReducers} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import {setInstructionsConstants} from '@cdo/apps/redux/instructions';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';

$(document).ready(() => {
  const script = document.querySelector('script[data-freeresponse]');
  const data = JSON.parse(script.dataset.freeresponse);

  var level = data.level;

  window.dashboard.codeStudioLevels.registerGetResult(function getResult() {
    var forceSubmittable =
      window.location.search.indexOf('force_submittable') !== -1;

    return {
      response: encodeURIComponent($('.free-response-textarea').val()),
      submitted: level.submittable || forceSubmittable,
      result: true,
      testResult: level.test_result
    };
  });

  registerReducers(commonReducers);

  var store = getStore();

  store.dispatch(
    setPageConstants({
      ttsShortInstructionsUrl: level.ttsShortInstructionsUrl,
      ttsLongInstructionsUrl: level.ttsLongInstructionsUrl,
      isEmbedView: false,
      noInstructionsWhenCollapsed: true,
      hasContainedLevels: false,
      puzzleNumber: level.puzzle_number,
      stageTotal: level.stage_total,
      userId: 1,
      verifiedTeacher: true,
      textToSpeechEnabled: true,
      isK1: false,
      noVisualization: true,
      isShareView: false,
      isProjectLevel: false,
      isSubmittable: false,
      isSubmitted: false,
      hideSource: true,
      isReadOnlyWorkspace: level.readonly || false
    })
  );

  store.dispatch(
    setInstructionsConstants({
      noInstructionsWhenCollapsed: true,
      overlayVisible: false,
      longInstructions: level.longInstructions,
      teacherMarkdown: level.solution,
      hasContainedLevels: false,
      levelVideos: null,
      mapReference: null,
      referenceLinks: null
    })
  );

  store.dispatch(setViewType(ViewType.Teacher));

  ReactDOM.render(
    <Provider store={getStore()}>
      <QuestionView
        level={data.level}
        readOnly={data.readonly}
        lastAttempt={data.last_attempt}
        showUnderageWarning={data.showUnderageWarning}
      />
    </Provider>,
    document.querySelector('#free-response')
  );
});
