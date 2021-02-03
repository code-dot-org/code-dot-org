import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import JavaIdeView from '../../../../javaIde/JavaIdeView';
import {getStore} from '../../../../code-studio/redux';
import javaIde from '../../../../javaIde/redux';
import {registerReducers} from '../../../../redux';

$(document).ready(function() {
  registerReducers({javaIde});
  ReactDOM.render(
    <Provider store={getStore()}>
      <JavaIdeView />
    </Provider>,
    document.getElementById('java-ide-container')
  );
});
