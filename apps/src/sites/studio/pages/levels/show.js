import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import ScriptLevelRedirectDialog from '@cdo/apps/code-studio/components/ScriptLevelRedirectDialog';
import {setIsMiniView} from '@cdo/apps/code-studio/progressRedux';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore, registerReducers} from '@cdo/apps/redux';
import instructions, {
  setTtsAutoplayEnabledForLevel,
  setCodeReviewEnabledForLevel,
  setTaRubric,
} from '@cdo/apps/redux/instructions';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import experiments from '@cdo/apps/util/experiments';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-level]');
  const config = JSON.parse(script.dataset.level);

  registerReducers({instructions});

  // this is the common js entry point for level pages
  // which is why ttsAutoplay is set here
  const ttsAutoplayEnabled = config.tts_autoplay_enabled;
  getStore().dispatch(setTtsAutoplayEnabledForLevel(ttsAutoplayEnabled));
  const codeReviewEnabled = config.code_review_enabled;
  getStore().dispatch(setCodeReviewEnabledForLevel(codeReviewEnabled));

  // If viewing the unit overview components on the level page it is in
  // the mini view
  getStore().dispatch(setIsMiniView(true));

  const redirectDialogMountPoint = document.getElementById('redirect-dialog');
  if (redirectDialogMountPoint && config.redirect_script_url) {
    ReactDOM.render(
      <ScriptLevelRedirectDialog
        redirectUrl={config.redirect_script_url}
        scriptName={config.script_name}
        courseName={config.course_name}
      />,
      redirectDialogMountPoint
    );
  }

  // AI Differentiation FAB to be shown only if rubric FAB is not.
  const renderAiDiffButton = () => {
    const reportingData = {
      unitName: config.script_name,
      courseName: config.course_name,
      levelName: config.level_name,
    };
    const differentiationContext = {type: AiDiffContext.LEVEL};
    if (hasScriptData('script[data-aiDiffData]')) {
      const aiDiffData = getScriptData('aiDiffData');
      const {levelId, scriptId} = aiDiffData;
      differentiationContext.levelId = levelId;
      differentiationContext.unitId = scriptId;
    }

    const aiDiffFabMountPoint = document.getElementById(
      'ai-differentiation-fab-mount-point'
    );
    if (aiDiffFabMountPoint && experiments.isEnabled('ai-diff-levels')) {
      ReactDOM.render(
        <Provider store={getStore()}>
          <AiDiffFloatingActionButton
            context={differentiationContext}
            scriptId={reportingData.unitName}
            scriptName={reportingData.unitName}
          />
        </Provider>,
        aiDiffFabMountPoint
      );
    }
  };

  if (hasScriptData('script[data-rubricdata]')) {
    const rubricData = getScriptData('rubricdata');
    const {rubric, studentLevelInfo, canShowTaScoresAlert} = rubricData;
    const reportingData = {
      unitName: config.script_name,
      courseName: config.course_name,
      levelName: config.level_name,
    };
    getStore().dispatch(setTaRubric(rubric));

    const rubricFabMountPoint = document.getElementById(
      'rubric-fab-mount-point'
    );
    if (rubricFabMountPoint) {
      //rubric fab mount point is only true for teachers
      if (
        !!rubric &&
        rubric.learningGoals.some(lg => lg.aiEnabled) &&
        config.level_name === rubric.level.name
      ) {
        analyticsReporter.sendEvent(
          EVENTS.TA_RUBRIC_AI_PAGE_VISITED,
          {
            ...reportingData,
            studentId: !!studentLevelInfo ? studentLevelInfo.user_id : '',
          },
          PLATFORMS.BOTH
        );
      }
      ReactDOM.render(
        <Provider store={getStore()}>
          <RubricFloatingActionButton
            rubric={rubric}
            studentLevelInfo={studentLevelInfo}
            reportingData={reportingData}
            currentLevelName={config.level_name}
            aiEnabled={rubric.learningGoals.some(lg => lg.aiEnabled)}
            canShowTaScoresAlert={canShowTaScoresAlert}
          />
        </Provider>,
        rubricFabMountPoint
      );
    } else {
      renderAiDiffButton();
    }
  } else {
    renderAiDiffButton();
  }
}
