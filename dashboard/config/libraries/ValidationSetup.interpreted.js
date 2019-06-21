/* This file is only executed within JSInterpreter */

function levelSuccess(testResult) {
  validationState = 'succeeded';
  validationResult = testResult;
}

function levelFailure(testResult, msg) {
  validationState = 'failed';
  validationResult = testResult;
  validationMessage = msg;
}

var validationProps = {};