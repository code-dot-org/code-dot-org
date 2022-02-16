/* This file is only executed within JSInterpreter */

function levelSuccess(testResult) {
  validationState = "succeeded";
  validationResult = testResult;
  validationMessage = "reinfFeedbackMsg";
}

function levelFailure(testResult, msg) {
  validationState = "failed";
  validationResult = testResult;
  validationMessage = msg;
}

var validationProps = {};

function check() {
  var results = validate();
  if (results) {
    if (results.state === "failed") {
      levelFailure(3, results.feedback);
    } else if (results.state === "succeeded") {
      levelFailure(0, results.feedback);
    }
  }
}
