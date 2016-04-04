/* global dashboard */

$(window).load(function () {
  $('#evaluationTable .new_question').click(function (event) {
    var bottomRow = event.target.parentElement.parentElement;
    var clonedRow = $('#evaluationTable .cloneableQuestionRow').clone(true);
    clonedRow.removeClass('cloneableQuestionRow');
    clonedRow.addClass('new_question_row');
    var newQuestionInput = clonedRow.find('input');
    newQuestionInput.addClass('new_question_name');
    newQuestionInput.keyup(handleNewQuestionName);
    clonedRow.insertBefore(bottomRow);
  });

  $('#evaluationTable .new_answer').click(function (event) {
    var clonedRow = $(event.target.parentElement.parentElement.parentElement).find('.cloneableAnswerRow').clone(true);
    clonedRow.removeClass('cloneableAnswerRow');
    clonedRow.addClass('new_answer_row');
    clonedRow.attr('question_id', event.target.getAttribute('question_id'));
    clonedRow.find('input').keyup(handleNewAnswer);
    clonedRow.find('select').change(handleNewAnswer);
    clonedRow.insertBefore(event.target.parentElement.parentElement);
  });

  function handleNewQuestionName() {
    $('#newQuestionsList').val(JSON.stringify($('.new_question_row .new_question_name').map(function() {
      return $(this).val();
    }).get()));

    //Future work item is to do better validation on submitted questions. Will come along with deletion
    $('#submitNewQuestions').prop("disabled", false);
  }

  function handleNewAnswer() {
    var newAnswerData = {};

    $('.question_section .new_answer_row').each(function (index, element) {
      var questionId = element.getAttribute('question_id');
      var answerText = $(element).find('input').val();
      var associatedModule = $(element).find('select').val();

      newAnswerData[questionId] = newAnswerData[questionId] || [];

      newAnswerData[questionId].push({
        answer: answerText,
        learningModuleId: associatedModule
      });
    });

    $('#newAnswersList').val(JSON.stringify(newAnswerData));
    $('#submitNewQuestions').prop('disabled', false);
  }
});
