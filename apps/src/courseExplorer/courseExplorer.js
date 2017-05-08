// Code for the Course/Tools Explorer.  Include it once on the page and it will
// handle both CourseExplorer and ToolsExplorer on the same page.

var detailRowShowing = -1;
var toolShowing = -1;

module.exports.initCourseExplorer = function () {
  $('.tool').click(function () {
    var row = ($(this).data('row'));
    var index = ($(this).data('index'));

    if (toolShowing === -1) {
      $('#detailrow-' + row).slideDown();
      $('#toolsextra-' + index).fadeIn();
      detailRowShowing = row;
      toolShowing = index;
    } else if (toolShowing === index) {
      $('#detailrow-' + detailRowShowing).slideUp();
      $('#toolsextra-' + index).fadeOut();
      detailRowShowing = -1;
      toolShowing = -1;
    } else if (detailRowShowing === row) {
      $('#toolsextra-' + toolShowing).fadeOut();
      $('#toolsextra-' + index).fadeIn();
      toolShowing = index;
    } else {
      $('#detailrow-' + detailRowShowing).slideUp();
      $('#toolsextra-' + toolShowing).fadeOut();
      $('#detailrow-' + row).slideDown();
      $('#toolsextra-' + index).fadeIn();
      detailRowShowing = row;
      toolShowing = index;
    }
  });

  $('.tool_arrow_box_close').click(function () {
    $('.detailrow').slideUp();
    toolShowing = -1;
  });
};
