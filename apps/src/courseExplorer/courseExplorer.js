// Code for the Course/Tools Explorer.  Include it once on the page and it will
// handle both CourseExplorer and ToolsExplorer on the same page.

let detailRowShowing = -1;
let toolShowingIndex = -1;

let courseShowingIndex = -1;

module.exports.initCourseExplorer = function () {
  $('.tool').click(function () {
    const row = ($(this).data('row'));
    const index = ($(this).data('index'));

    if (toolShowingIndex === -1) {
      $('#detailrow-' + row).slideDown();
      $('#toolsextra-' + index).fadeIn();
      detailRowShowing = row;
      toolShowingIndex = index;
    } else if (toolShowingIndex === index) {
      $('#detailrow-' + detailRowShowing).slideUp();
      $('#toolsextra-' + index).fadeOut();
      detailRowShowing = -1;
      toolShowingIndex = -1;
    } else if (detailRowShowing === row) {
      $('#toolsextra-' + toolShowingIndex).fadeOut();
      $('#toolsextra-' + index).fadeIn();
      toolShowingIndex = index;
    } else {
      $('#detailrow-' + detailRowShowing).slideUp();
      $('#toolsextra-' + toolShowingIndex).fadeOut();
      $('#detailrow-' + row).slideDown();
      $('#toolsextra-' + index).fadeIn();
      detailRowShowing = row;
      toolShowingIndex = index;
    }
  });

  $('.tool_arrow_box_close').click(function () {
    $('.detailrow').slideUp();
    toolShowingIndex = -1;
  });

  $('.course.break').click(function () {
    const courseIndex = $(this).attr("data-courseindex");

    if (courseShowingIndex === -1) {
      $('#courseextra-' + courseIndex).slideDown();
      $('#course-' + courseIndex + ' .arrow-down').hide();
      $('#course-' + courseIndex + ' .arrow-up').show();
      courseShowingIndex = courseIndex;
    } else if (courseShowingIndex === courseIndex) {
      $('#courseextra-' + courseIndex).slideUp();
      $('#course-' + courseIndex + ' .arrow-down').show();
      $('#course-' + courseIndex + ' .arrow-up').hide();
      courseShowingIndex = -1;
    } else {
      $('#courseextra-' + courseShowingIndex).slideUp();
      $('#course-' + courseShowingIndex + ' .arrow-down').show();
      $('#course-' + courseShowingIndex + ' .arrow-up').hide();
      $('#courseextra-' + courseIndex).slideDown();
      $('#course-' + courseIndex + ' .arrow-down').hide();
      $('#course-' + courseIndex + ' .arrow-up').show();
      courseShowingIndex = courseIndex;
    }
  });

  $('.arrow_box_close').click(function () {
    const courseIndex = $(this).attr("data-courseindex");
    $('#courseextra-' + courseIndex).slideUp();
    courseShowingIndex = -1;
  });
};
