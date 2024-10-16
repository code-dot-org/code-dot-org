import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import CourseRollup from '@cdo/apps/templates/courseRollupPages/CourseRollup';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-courses-rollup]');
  const courseData = JSON.parse(script.dataset.coursesRollup);
  const courseSummary = courseData.course_summary;

  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <CourseRollup objectToRollUp={'Standards'} course={courseSummary} />
    </Provider>,
    document.getElementById('roll_up')
  );
}
