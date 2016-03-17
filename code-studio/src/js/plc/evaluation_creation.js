/* global dashboard */

$(window).load(function () {
  $('#evaluationTable .new_question').click(function (event) {
    var bottomRow = event.target.parentElement.parentElement;
    var clonedRow = $('#evaluationTable .cloneableQuestionRow')[0].cloneNode(true);
    clonedRow.className = 'new_question_row';
    $(clonedRow).find('input')[0].className = 'new_question_name';

    $(clonedRow).insertBefore(bottomRow);

    $('#evaluationTable input').last().keyup(handleNewQuestionName);
  });

  $('#evaluationTable .new_answer').click(function (event) {
    var clonedRow = $(event.target.parentElement.parentElement.parentElement).find('.cloneableAnswerRow')[0].cloneNode(true);
    clonedRow.className = 'new_answer_row';
    clonedRow.setAttribute('question_id', event.target.getAttribute('question_id'));

    $(clonedRow).insertBefore(event.target.parentElement.parentElement);

    $(clonedRow).find('input').keyup(handleNewAnswer);
    $(clonedRow).find('select').change(handleNewAnswer);
  });

  function handleNewQuestionName() {
    $('#newQuestionsList').val(JSON.stringify($('.new_question_row .new_question_name').map(function() { return $(this).val(); }).get()));

    //Need to find a better way to see if nothing has been edited
    $('#submitNewQuestions').prop("disabled", false);
  }

  function handleNewAnswer() {
    var newAnswerData = {};

    $('.question_section .new_answer_row').each(function (index, element) {
      var questionId = element.getAttribute('question_id');
      var answerText = $(element).find('input').val();
      var associatedModule = $(element).find('select').val();

      if(newAnswerData[questionId]) {
        newAnswerData[questionId].push({'answer': answerText, 'learningModuleId': associatedModule});
      } else {
        newAnswerData[questionId] = [{'answer': answerText, 'learningModuleId': associatedModule}];
      }
    });

    $('#newAnswersList').val(JSON.stringify(newAnswerData));
    $('#submitNewQuestions').prop('disabled', false);
  }
});