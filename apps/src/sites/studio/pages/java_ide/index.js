import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import JavaIdeView from '@cdo/apps/javaide/JavaIdeView';
import {getStore} from '@cdo/apps/code-studio/redux';

$(document).ready(function() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavaIdeView />
    </Provider>,
    document.getElementById('java-ide-container')
  );
});
