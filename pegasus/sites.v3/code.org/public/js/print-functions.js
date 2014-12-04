function createHiddenPrintWindow(src) {
  var iframe = $('<iframe id="print_frame" ></iframe>'); // Created a hidden iframe with just the desired image as its contents
  iframe.appendTo("body");
  iframe[0].contentWindow.document.write("<img src='" + src + "' style='width: 100%'/>");
  iframe[0].contentWindow.document.write("<script>if (document.execCommand('print', false, null)) {  } else { window.print();  } </script>");
  $("#print_frame").remove(); // Remove the iframe when the print dialogue has been launched
}