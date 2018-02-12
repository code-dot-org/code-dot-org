import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import MakerLanding from '@cdo/apps/templates/MakerLanding';

$(function () {
  const store = getStore();
  const script = document.querySelector('script[data-makerHome]');
  const makerHomeData = JSON.parse(script.dataset.makerhome);
  const course = makerHomeData.course;

  ReactDOM.render(
    <Provider store={store}>
      <MakerLanding
        topCourse={course}
      />
    </Provider>,
    document.getElementById('maker-home')
  );
});
