/* global dashboard */

$(window).load(function () {
  $('#confirm_assignments').click(function () {
    var moduleAssignments = [];

    $('#learning_module_ids option:selected').each( function () {
      if (this.value) {
        moduleAssignments.push(this.value);
      }
    });

    $('#learning_module_list').val(moduleAssignments);
  });
});
