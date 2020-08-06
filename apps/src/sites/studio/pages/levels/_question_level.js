import React from 'react';
import ReactDOM from 'react-dom';
import QuestionView from '../../../../code-studio/components/QuestionView';
import {Provider} from 'react-redux/src';
import {getStore, registerReducers} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import * as codeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {
  setInstructionsConstants,
  setInstructionsMaxHeightAvailable
} from '@cdo/apps/redux/instructions';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';

function getResult(level) {
  return function() {
    var forceSubmittable =
      window.location.search.indexOf('force_submittable') !== -1;

    return {
      response: encodeURIComponent($('.free-response-textarea').val()),
      submitted: level.submittable || forceSubmittable,
      result: true,
      testResult: level.test_result
    };
  };
}

$(document).ready(() => {
  const script = document.querySelector('script[data-questionlevel]');
  const data = JSON.parse(script.dataset.questionlevel);

  var level = data.level;

  codeStudioLevels.registerGetResult(getResult(data.level));

  registerReducers(commonReducers);

  var store = getStore();

  store.dispatch(
    setPageConstants({
      stageTotal: level.stage_total,
      verifiedTeacher: data.isVerifiedTeacher,
      isSubmitted: data.appOptions.submitted,
      userId: data.appOptions.userId,
      puzzleNumber: data.appOptions.levelPosition,
      isSubmittable: !!data.appOptions.level.submittable,
      isReadOnlyWorkspace: data.appOptions.readonlyWorkspace,
      is13Plus: data.appOptions.is13Plus,
      textToSpeechEnabled: true,
      isK1: false,
      noVisualization: true,
      isShareView: false,
      isProjectLevel: false,
      hideSource: true,
      isEmbedView: false,
      noInstructionsWhenCollapsed: true,
      hasContainedLevels: false,
      serverLevelId: level.id,
      ttsLongInstructionsUrl: level.tts_long_instructions_url,
      locale: 'en_us'
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
      freeResponseTextAreaHeight: level.height,
      freeResponseTitle: level.title,
      allowUserUploads: level.allow_user_uploads,
      freeResponseLastAttempt: data.last_attempt,
      freeResponseProjectId: data.appOptions.channel
    })
  );

  var questionAreaHeight = $(window).height() - 50 - 165 - 70; //header - footer - extra

  store.dispatch(setInstructionsMaxHeightAvailable(questionAreaHeight));

  if (data.isTeacher) {
    store.dispatch(setViewType(ViewType.Teacher));
  } else {
    store.dispatch(setViewType(ViewType.Student));
  }

  ReactDOM.render(
    <Provider store={getStore()}>
      <QuestionView />
    </Provider>,
    document.querySelector('#question-level')
  );
});
