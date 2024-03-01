import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';
import ScriptLevelRedirectDialog from '@cdo/apps/code-studio/components/ScriptLevelRedirectDialog';
import UnversionedScriptRedirectDialog from '@cdo/apps/code-studio/components/UnversionedScriptRedirectDialog';
import {setIsMiniView} from '@cdo/apps/code-studio/progressRedux';
import instructions, {
  setTtsAutoplayEnabledForLevel,
  setCodeReviewEnabledForLevel,
  setTaRubric,
} from '@cdo/apps/redux/instructions';
import {setLevel, setScriptId} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import experiments from '@cdo/apps/util/experiments';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import AITutorFloatingActionButton from '@cdo/apps/code-studio/components/aiTutor/aiTutorFloatingActionButton';

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
  const unversionedRedirectDialogMountPoint = document.getElementById(
    'unversioned-redirect-dialog'
  );
  if (redirectDialogMountPoint && config.redirect_script_url) {
    ReactDOM.render(
      <ScriptLevelRedirectDialog
        redirectUrl={config.redirect_script_url}
        scriptName={config.script_name}
        courseName={config.course_name}
      />,
      redirectDialogMountPoint
    );
  } else if (
    unversionedRedirectDialogMountPoint &&
    config.show_unversioned_redirect_warning
  ) {
    ReactDOM.render(
      <UnversionedScriptRedirectDialog />,
      unversionedRedirectDialogMountPoint
    );
  }

  if (hasScriptData('script[data-aitutordata]')) {
    const aiTutorData = getScriptData('aitutordata');
    const {levelId, type, hasValidation, isAssessment, isProjectBacked} =
      aiTutorData;
    const level = {
      id: levelId,
      type: type,
      hasValidation: hasValidation,
      isAssessment: isAssessment,
      isProjectBacked: isProjectBacked,
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

  const inRubricsPilot =
    experiments.isEnabled('ai-rubrics') ||
    experiments.isEnabled('non-ai-rubrics');
  if (inRubricsPilot && hasScriptData('script[data-rubricdata]')) {
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
      ReactDOM.render(
        <Provider store={getStore()}>
          <RubricFloatingActionButton
            rubric={rubric}
            studentLevelInfo={studentLevelInfo}
            reportingData={reportingData}
            currentLevelName={config.level_name}
            aiEnabled={experiments.isEnabled('ai-rubrics')}
          />
        </Provider>,
        rubricFabMountPoint
      );
    }
  }
}
