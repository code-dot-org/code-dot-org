/* global dashboard */

$(window).load(function () {
  $('#submit_evaluation').click(function () {
    var evaluationResponses = [];

    $('input:checked').each(function () {
      if (this.hasAttribute('value')) {
        evaluationResponses.push(this.value);
      }
    });

    $('#answer_module_list').val(evaluationResponses);
  });
});
