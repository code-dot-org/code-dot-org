import React from 'react';
import ReactDOM from 'react-dom';
import MakerSetupGuide from '@cdo/apps/lib/kits/maker/ui/MakerSetupGuide';

$(function() {
  ReactDOM.render(<MakerSetupGuide />, document.getElementById('maker-setup'));
  $('#maker-setup a').attr('target', '_blank');
});
