import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import Lab2 from '@cdo/apps/labs/views/lab2';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <Lab2 />
    </Provider>,
    document.getElementById('lab2-container')
  );
});
