import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import MakerLanding from '@cdo/apps/templates/MakerLanding';
import getScriptData from '@cdo/apps/util/getScriptData';

$(function () {
  const store = getStore();
  const course = getScriptData('makerHome').course;

  ReactDOM.render(
    <Provider store={store}>
      <MakerLanding topCourse={course} />
    </Provider>,
    document.getElementById('maker-home')
  );
});
