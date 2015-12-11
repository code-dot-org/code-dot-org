/**
 * (brent): We have very similar code in pegasus:
 * pegasus/sites/all/views/popup_window.js.haml
 * This appears to be attaching a click handler to popup-window. In addition to
 * the places in pegasus, we have popup-window in:
 * dashboard/app/assets/javascripts/components/share_dialog_body.jsx
 * apps/src/templates/sharing.html.ejs
 * In both cases, this code probably better belongs elsewhere
 */

$(document).ready(function() {
  $('body').on('click', 'a.popup-window', function() {
    var url = $(this).attr('href');
    var width = 640;
    var height = 480;
    var left = (screen.width/2)-(width/2);
    var top = (screen.height/2)-(height/2);

    var share = window.open(url,'Share', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
    if (window.focus) {
      share.focus();
    }
    return false;
  });
});
