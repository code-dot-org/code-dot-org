import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import CourseRollup from '@cdo/apps/templates/courseRollupPages/CourseRollup';
import {prepareBlocklyForEmbeddingAllEnvironments} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  prepareBlocklyForEmbeddingAllEnvironments();
  initPage();
});

function initPage() {
  const script = document.querySelector('script[data-courses-rollup]');
  const courseData = JSON.parse(script.dataset.coursesRollup);
  const courseSummary = courseData.course_summary;

  const store = getStore();

  createReactRoot(
    <Provider store={store}>
      <CourseRollup objectToRollUp={'Code'} course={courseSummary} />
    </Provider>,
    document.getElementById('roll_up')
  );
}
