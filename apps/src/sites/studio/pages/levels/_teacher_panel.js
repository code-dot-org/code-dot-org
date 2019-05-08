import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  const teacherPanel = document.getElementById('level-teacher-panel');
  if (teacherPanel) {
    console.log('found #level-teacher-panel');
  }
}
