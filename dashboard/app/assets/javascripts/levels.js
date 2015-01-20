onInitializeListeners = [];
onInitializeListeners.push(function() {
  $('#builder-coordinate-submit').click(function(e) {
    e.preventDefault();
    if (confirm('Warning: This will erase any solution blocks you may have placed. If you want to save your solution, first click "Run" and then later update the X/Y/Start Direction fields from the Edit form.')) {
      var form = $(this).closest('form');
      var x = form.find('input[name="x"]').val();
      var y = form.find('input[name="y"]').val();
      var start_direction = form.find('#start_direction').val();
      window.location.href = jQuery.query.set("x", x).set("y", y).set("start_direction", start_direction).toString();
    }
  });
});
