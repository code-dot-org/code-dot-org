// Pre-fill text area with previous response content
$('textarea.response').val(appOptions.level.lastAttempt);

function getResult()
{
  var response = $('textarea.response').val();
  var answers = appOptions.level.answers;
  if (answers) {
    response = response.replace(/\s+/g, '');
    var result = answers.some(function(element) {
      return response == element.replace(/\s+/g, '');
    });
    return {
      response: encodeURIComponent(response),
      result: result
    };
  } else {
    // Always succeed for any non-empty response to open-ended question without answer(s)
    return {
      response: encodeURIComponent(response),
      result: response.length > 0
    };
  }
}
