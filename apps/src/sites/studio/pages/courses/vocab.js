import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import CourseOrUnitRollup from '@cdo/apps/templates/courseRollupPages/CourseOrUnitRollup';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-courses-rollup]');
  const courseData = JSON.parse(script.dataset.coursesRollup);
  const courseSummary = courseData.course_summary;

  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <CourseOrUnitRollup
        objectToRollUp={'Vocabulary'}
        course={courseSummary}
      />
    </Provider>,
    document.getElementById('roll_up')
  );
}
