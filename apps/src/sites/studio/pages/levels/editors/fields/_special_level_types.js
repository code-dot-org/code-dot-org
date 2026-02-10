import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import LinkToRubricEditor from '@cdo/apps/levelbuilder/rubrics/LinkToRubricEditor';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(initPage);

function initPage() {
  const lessons = getScriptData('lessons');
  $('#plusAnswerContainedLevel').on('click', () => {
    $('#plusAnswerContainedLevel')
      .prev()
      .clone()
      .insertBefore('#plusAnswerContainedLevel');
  });

  ReactDOM.render(
    <LinkToRubricEditor lessons={lessons} />,
    document.getElementById('link-to-rubric-editor')
  );
}
