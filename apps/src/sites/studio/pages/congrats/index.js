import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import Congrats from '@cdo/apps/templates/Congrats';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';

$(document).ready(function () {
  const store = getStore();
  const isRtl = isRtlFromDOM();
  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        completedTutorialType="other"
        isRtl={isRtl}
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
