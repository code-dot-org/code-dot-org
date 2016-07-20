/* global dashboard */
import $ from 'jquery';

$(window).load(function () {
  $('#submit_evaluation').click(function () {
    var evaluationResponses = {};

    $('input:checked').each(function () {
      if (this.hasAttribute('value')) {
        if (evaluationResponses[this.value]) {
          evaluationResponses[this.value] += this.getAttribute('weight');
        } else {
          evaluationResponses[this.value] = this.getAttribute('weight');
        }
      }
    });

    $('#answer_module_list').val(JSON.stringify(evaluationResponses));
  });
});
