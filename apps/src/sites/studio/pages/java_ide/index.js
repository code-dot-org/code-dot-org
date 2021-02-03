import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import JavaIdeView from '../../../../javaide/JavaIdeView';
import {getStore} from '../../../../code-studio/redux';

$(document).ready(function() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavaIdeView />
    </Provider>,
    document.getElementById('java-ide-container')
  );
});
