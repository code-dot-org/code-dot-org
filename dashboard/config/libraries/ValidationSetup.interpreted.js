/* This file is only executed within JSInterpreter */

function levelSuccess(testResult) {
  validationState = 'succeeded';
  validationResult = testResult;
}

function levelFailure(msg) {
  validationState = 'failed';
  validationResult = msg;
}

var validationProps = {};