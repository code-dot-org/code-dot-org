import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {getStore, registerReducers} from '@cdo/apps/redux';
import ScriptLevelRedirectDialog from '@cdo/apps/code-studio/components/ScriptLevelRedirectDialog';
import UnversionedScriptRedirectDialog from '@cdo/apps/code-studio/components/UnversionedScriptRedirectDialog';
import sectionData, {
  setCodeReviewEnabled
} from '@cdo/apps/redux/sectionDataRedux';
import {setIsMiniView} from '@cdo/apps/code-studio/progressRedux';
import instructions, {
  setTtsAutoplayEnabled
} from '@cdo/apps/redux/instructions';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-level]');
  const config = JSON.parse(script.dataset.level);

  registerReducers({sectionData, instructions});
  // this is the common js entry point for level pages
  // which is why ttsAutoplay is set here
  const ttsAutoplayEnabled = config.tts_autoplay_enabled;
  getStore().dispatch(setTtsAutoplayEnabled(ttsAutoplayEnabled));
  const codeReviewEnabled = config.code_review_enabled;
  getStore().dispatch(setCodeReviewEnabled(codeReviewEnabled));

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
}
