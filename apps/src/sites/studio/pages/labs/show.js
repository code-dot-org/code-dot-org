import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '../../../../code-studio/redux';
import LabView from '../../../../labs/LabView';
import getScriptData from '../../../../util/getScriptData';

$(document).ready(function() {
  const level = getScriptData('data-level');

  ReactDOM.render(
    <Provider store={getStore()}>
      <LabView />
    </Provider>,
    document.getElementById('lab-container')
  );
});
