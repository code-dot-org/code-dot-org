import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {setLevel, setScriptId} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import AITutorFloatingActionButton from '@cdo/apps/aiTutor/views/AITutorFloatingActionButton';
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
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';

$(document).ready(initPage);

function initPage() {
  // Only send LEVEL_ACTIVITY event for students or non-authenticated users
  if (getStore().getState().currentUser?.userType !== 'teacher') {
    analyticsReporter.sendEvent(EVENTS.LEVEL_ACTIVITY, {}, PLATFORMS.BOTH);
  }
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

  if (hasScriptData('script[data-aitutordata]')) {
    const aiTutorData = getScriptData('aitutordata');
    const {
      levelId,
      type,
      hasValidation,
      aiTutorAvailable,
      isAssessment,
      progressionType,
    } = aiTutorData;
    const level = {
      id: levelId,
      type,
      hasValidation,
      aiTutorAvailable,
      isAssessment,
      progressionType,
    };
    getStore().dispatch(setLevel(level));
    getStore().dispatch(setScriptId(aiTutorData.scriptId));
    const aiTutorFabMountPoint = document.getElementById(
      'ai-tutor-fab-mount-point'
    );
    if (aiTutorFabMountPoint) {
      ReactDOM.render(
        <Provider store={getStore()}>
          <AITutorFloatingActionButton />
        </Provider>,
        aiTutorFabMountPoint
      );
    }
  }

  if (hasScriptData('script[data-rubricdata]')) {
    const rubricData = getScriptData('rubricdata');
    const {rubric, studentLevelInfo} = rubricData;
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
          />
        </Provider>,
        rubricFabMountPoint
      );
    }
  }
}
