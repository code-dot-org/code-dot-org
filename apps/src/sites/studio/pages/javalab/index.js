import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import JavalabView from '@cdo/apps/javalab/JavalabView';
import {getStore} from '@cdo/apps/code-studio/redux';
import javalab from '@cdo/apps/javalab/javalabRedux';
import {registerReducers} from '@cdo/apps/redux';

$(document).ready(function() {
  registerReducers({javalab});
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavalabView />
    </Provider>,
    document.getElementById('java-lab-container')
  );
});
