// Code for the Course/Tools Explorer.  Include it once on the page and it will
// handle both CourseExplorer and ToolsExplorer on the same page.

let detailRowShowing = -1;
let toolShowingIndex = -1;

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
};
