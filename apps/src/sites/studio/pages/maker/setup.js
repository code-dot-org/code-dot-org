import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';
import {getStore} from '@cdo/apps/redux';

$(function() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <SetupGuide />
    </Provider>,
    document.getElementById('maker-setup')
  );
  $('#maker-setup a').attr('target', '_blank');
});
