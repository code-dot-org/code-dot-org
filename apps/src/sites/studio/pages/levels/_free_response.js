import React from 'react';
import ReactDOM from 'react-dom';
import QuestionView from '../../../../code-studio/components/QuestionView';
import {Provider} from 'react-redux/src';
import {getStore, registerReducers} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import {
  setInstructionsConstants,
  setInstructionsMaxHeightAvailable
} from '@cdo/apps/redux/instructions';
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
      stageTotal: level.stage_total,
      verifiedTeacher: true,
      isSubmitted: data.appOptions.submitted,
      userId: data.appOptions.userId,
      puzzleNumber: data.appOptions.levelPosition,
      isSubmittable: !!data.appOptions.level.submittable,
      isReadOnlyWorkspace: data.appOptions.readonlyWorkspace,
      is13Plus: data.appOptions.is13Plus,

      //needed for top instructions
      textToSpeechEnabled: false,
      isK1: false,
      noVisualization: true,
      isShareView: false,
      isProjectLevel: false,
      hideSource: true,
      isEmbedView: false,
      noInstructionsWhenCollapsed: true,
      hasContainedLevels: false
    })
  );

  store.dispatch(
    setInstructionsConstants({
      longInstructions: data.appOptions.level.longInstructions,
      teacherMarkdown: level.solution,
      levelVideos: data.appOptions.level.levelVideos,
      mapReference: data.appOptions.level.mapReference,
      referenceLinks: data.appOptions.level.referenceLinks,
      noInstructionsWhenCollapsed: true,
      overlayVisible: false,
      hasContainedLevels: false,
      freeResponsePlaceholder: level.placeholder,
      freeResponseTextAreaHeight: level.height
    })
  );

  var questionAreaHeight = $(window).height() - 50 - 165 - 125 - 50; //header - footer - button - extra

  store.dispatch(setInstructionsMaxHeightAvailable(questionAreaHeight));

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
