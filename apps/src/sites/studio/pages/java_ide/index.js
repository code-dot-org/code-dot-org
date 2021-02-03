import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import JavalabView from '../../../../javalab/JavalabView';
import {getStore} from '../../../../code-studio/redux';
import javalab from '../../../../javalab/redux';
import {registerReducers} from '../../../../redux';

$(document).ready(function() {
  console.log('registering reducer?');
  registerReducers({javalab});
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavalabView />
    </Provider>,
    document.getElementById('java-ide-container')
  );
});
