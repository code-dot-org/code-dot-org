import $ from 'jquery';
import React from 'react';

import LinkToRubricEditor from '@cdo/apps/levelbuilder/rubrics/LinkToRubricEditor';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
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
  const linkToRubricContainer = document.getElementById(
    'link-to-rubric-editor'
  );
  if (linkToRubricContainer) {
    createReactRoot(
      <LinkToRubricEditor lessons={lessons} />,
      linkToRubricContainer
    );
  }
}
