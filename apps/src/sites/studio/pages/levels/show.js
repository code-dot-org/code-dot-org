import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ScriptLevelRedirectDialog from '@cdo/apps/code-studio/components/ScriptLevelRedirectDialog';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-level]');
  const config = JSON.parse(script.dataset.level);

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
