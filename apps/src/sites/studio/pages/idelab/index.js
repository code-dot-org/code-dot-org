import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Idelab from '@cdo/apps/idelab/Idelab';
import {getStore} from '@cdo/apps/code-studio/redux';
import idelab from '@cdo/apps/idelab/idelabRedux';
import {registerReducers} from '@cdo/apps/redux';

$(document).ready(function() {
  registerReducers({idelab});
  ReactDOM.render(
    <Provider store={getStore()}>
      <Idelab />
    </Provider>,
    document.getElementById('ide-lab-container')
  );
});
