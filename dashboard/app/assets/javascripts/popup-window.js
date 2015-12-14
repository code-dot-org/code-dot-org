window.dashboard = window.dashboard || {};

window.dashboard.popupWindow = (function () {
  /**
   * Note: We have similar code in pegasus:
   * pegasus/sites/all/views/popup_window.js.haml
   * @returns jQuery event handler for when we click on a share button. Pops up
   *   a new window with contents of href.
   */
  return function () {
    var url = $(this).attr('href');
    var width = 640;
    var height = 480;
    var left = (screen.width / 2) - (width / 2);
    var top = (screen.height / 2) - (height / 2);

    var share = window.open(url,'Share', 'toolbar=no, location=no, ' +
      'directories=no, status=no, menubar=no, scrollbars=no, resizable=no, ' +
      'copyhistory=no, width=' + width + ', height=' + height + ', top=' + top +
      ', left=' + left);
    if (!share) {
      // If window.open fails, just return such that
      return true;
    }
    if (window.focus) {
      share.focus();
    }
    return false;
  };
})();
