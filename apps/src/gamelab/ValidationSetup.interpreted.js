/* eslint-disable */
function levelSuccess(testResult) {
  validationState = 'succeeded';
  validationResult = testResult;
}

function levelFailure(msg) {
  validationState = 'failed';
  validationResult = msg;
}
