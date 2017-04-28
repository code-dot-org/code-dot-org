import React from 'react';
import ReactDOM from 'react-dom';
import SetupChecklist from '@cdo/apps/lib/kits/maker/ui/SetupChecklist';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';

$(function () {
  const setupChecker = new SetupChecker();
  ReactDOM.render(
      <SetupChecklist setupChecker={setupChecker}/>,
      document.getElementById('setup-status-mount')
  );
  $('.maker-setup a').attr('target', '_blank');
});
