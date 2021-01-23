import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '../code-studio/redux';
import JavalabView from './JavalabView';

$(document).ready(function() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavalabView />
    </Provider>,
    document.getElementById('java-lab-container')
  );
});
