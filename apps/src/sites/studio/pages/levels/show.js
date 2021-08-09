import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {getStore, registerReducers} from '@cdo/apps/redux';
import ScriptLevelRedirectDialog from '@cdo/apps/code-studio/components/ScriptLevelRedirectDialog';
import sectionData, {
  setTtsAutoplayEnabled
} from '@cdo/apps/redux/sectionDataRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-level]');
  const config = JSON.parse(script.dataset.level);

  // this is the common js entry point for level pages
  // which is why ttsAutoplay is set here
  registerReducers({sectionData});
  const ttsAutoplayEnabled = config.tts_autoplay_enabled;
  getStore().dispatch(setTtsAutoplayEnabled(ttsAutoplayEnabled));

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
}
