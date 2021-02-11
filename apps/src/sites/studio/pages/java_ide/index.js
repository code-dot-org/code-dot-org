import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import JavaIdeView from '@cdo/apps/javaide/JavaIdeView';
import {getStore} from '@cdo/apps/code-studio/redux';
import javaIde from '@cdo/apps/javaide/javaIdeRedux';
import {registerReducers} from '@cdo/apps//redux';

$(document).ready(function() {
  registerReducers({javaIde});
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavaIdeView />
    </Provider>,
    document.getElementById('java-ide-container')
  );
});
