import React from 'react';
import ReactDOM from 'react-dom';
import BoardSetupCheck from '@cdo/apps/lib/kits/maker/ui/BoardSetupCheck';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';

$(function () {
  const setupChecker = new SetupChecker();
  ReactDOM.render(
      <BoardSetupCheck setupChecker={setupChecker}/>,
      document.getElementById('setup-status-mount')
  );
  $('.maker-setup a').attr('target', '_blank');
});
