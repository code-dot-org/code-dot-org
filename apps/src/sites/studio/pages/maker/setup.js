import React from 'react';
import ReactDOM from 'react-dom';
import BoardSetupCheck from '@cdo/apps/lib/kits/maker/ui/BoardSetupCheck';

$(function () {
  ReactDOM.render(<BoardSetupCheck/>, document.getElementById('setup-status-mount'));
  $('.maker-setup a').attr('target', '_blank');
});
