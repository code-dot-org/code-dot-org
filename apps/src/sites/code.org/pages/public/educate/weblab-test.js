import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import WebLabTest from '@cdo/apps/templates/testPages/WebLabTest.jsx';

registerReducers({isRtl, responsive});

$(document).ready(initWebLabTest);

function showWebLabTest() {
  const webLabTestElement = $('#weblab-test');

  ReactDOM.render(
    <Provider store={getStore()}>
      <WebLabTest />
    </Provider>,
    webLabTestElement[0]
  );
}

function initWebLabTest() {
  initResponsive();
  showWebLabTest();
}
