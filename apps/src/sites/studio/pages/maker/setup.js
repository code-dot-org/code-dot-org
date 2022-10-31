import React from 'react';
import ReactDOM from 'react-dom';
import SetupInstructions from '@cdo/apps/lib/kits/maker/ui/SetupInstructions';

$(function() {
  ReactDOM.render(
    <SetupInstructions />,
    document.getElementById('setup-status-mount')
  );
  $('.maker-setup a').attr('target', '_blank');
});
