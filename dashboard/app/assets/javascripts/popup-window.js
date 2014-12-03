$(document).ready(function() {
  $('body').on('click', 'a.popup-window', function() {
    var url = $(this).attr('href');
    var width = 640;
    var height = 480;
    var left = (screen.width/2)-(width/2);
    var top = (screen.height/2)-(height/2);

    share = window.open(url,'Share', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
    if (window.focus) { share.focus() }
    return false;
  });
});
