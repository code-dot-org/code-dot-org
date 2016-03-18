/**
 * Note: We have similar code in pegasus:
 * pegasus/sites/all/views/popup_window.js.haml
 * @returns jQuery event handler for when we click on a share button. Pops up
 *   a new window with contents of href.
 */
module.exports = function popupWindow(event) {
  var url = $(event.currentTarget).attr('href');
  var width = 640;
  var height = 480;
  var left = (screen.width / 2) - (width / 2);
  var top = (screen.height / 2) - (height / 2);

  var share = window.open(url,'Share', 'toolbar=no, location=no, ' +
    'directories=no, status=no, menubar=no, scrollbars=no, resizable=no, ' +
    'copyhistory=no, width=' + width + ', height=' + height + ', top=' + top +
    ', left=' + left);
  if (!share) {
    // If window.open fails for some reason, just return such that we still
    // open the url in a new tab
    return true;
  }
  if (window.focus) {
    share.focus();
  }
  return false;
};
