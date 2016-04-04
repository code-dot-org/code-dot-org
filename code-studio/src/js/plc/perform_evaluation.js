/* global dashboard */

$(window).load(function () {
  $('#submitEvaluation').click(function() {
    var evaluationResponses = [];

    $('input:checked').each(function() {
      if (this.value) {
        evaluationResponses.push(this.value);
      }
    });

    $('#answerModuleList').val(evaluationResponses);
  });
});
