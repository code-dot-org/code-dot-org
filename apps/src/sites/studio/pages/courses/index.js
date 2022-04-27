import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {initCourseExplorer} from '@cdo/apps/courseExplorer/courseExplorer';
import {getStore} from '@cdo/apps/code-studio/redux';
import CourseCatalog from '../../../../templates/studioHomepages/CourseCatalog';

$(document).ready(showCourses);

function showCourses() {
  // Initialize the non-React Course/Tool Explorer component code.
  initCourseExplorer();

  const script = document.querySelector('script[data-courses]');
  const coursesData = JSON.parse(script.dataset.courses);

  ReactDOM.render(
    <Provider store={getStore()}>
      <CourseCatalog courseOfferings={coursesData.courseOfferings} />
    </Provider>,
    document.getElementById('courses-container')
  );
}
