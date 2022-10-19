import React from 'react';
import ReactDOM from 'react-dom';
import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';

$(function() {
  ReactDOM.render(<SetupGuide />, document.getElementById('maker-setup'));
  $('#maker-setup a').attr('target', '_blank');
});
