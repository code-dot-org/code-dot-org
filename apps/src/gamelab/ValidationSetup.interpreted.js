/* eslint-disable */
function levelSuccess(testResult) {
  __validationState = 'succeeded';
  __validationResult = testResult;
}

function levelFailure(msg) {
  __validationState = 'failed';
  __validationResult = msg;
}
