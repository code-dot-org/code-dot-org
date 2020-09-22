import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  $('#plusAnswerContainedLevel').on('click', () => {
    $('#plusAnswerContainedLevel')
      .prev()
      .clone()
      .insertBefore('#plusAnswerContainedLevel');
  });
}
