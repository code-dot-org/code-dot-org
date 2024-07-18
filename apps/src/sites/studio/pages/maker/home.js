import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import MakerLanding from '@cdo/apps/templates/MakerLanding';
import getScriptData from '@cdo/apps/util/getScriptData';

$(function () {
  const store = getStore();
  const course = getScriptData('makerHome').course;

  const root = createRoot(document.getElementById('maker-home'));

  root.render(
    <Provider store={store}>
      <MakerLanding topCourse={course} />
    </Provider>
  );
});
