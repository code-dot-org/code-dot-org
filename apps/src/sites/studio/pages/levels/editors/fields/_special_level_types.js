import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

$(document).ready(initPage);

function initPage() {
  $('#plusAnswerContainedLevel').on('click', () => {
    $('#plusAnswerContainedLevel')
      .prev()
      .clone()
      .insertBefore('#plusAnswerContainedLevel');
  });

  ReactDOM.render(
    <div>test</div>,
    document.getElementById('link-to-rubric-editor')
  );
}
