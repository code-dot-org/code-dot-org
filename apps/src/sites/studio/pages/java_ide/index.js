import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import JavalabView from '../../../../javalab/JavalabView';
import {getStore} from '../../../../code-studio/redux';

$(document).ready(function() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavalabView />
    </Provider>,
    document.getElementById('java-ide-container')
  );
});
