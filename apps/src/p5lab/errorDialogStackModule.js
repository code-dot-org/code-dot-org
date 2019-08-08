/** @file Redux actions and reducer for the Error Dialog Stack component */
var REPORT_ERROR = 'ErrorDialogStack/REPORT_ERROR';
var DISMISS_ERROR = 'ErrorDialogStack/DISMISS_ERROR';

exports.default = function reducer(state, action) {
  state = state || [];
  switch (action.type) {
    case REPORT_ERROR:
      return [
        {
          message: action.message,
          error_type: action.error_type,
          error_cause: action.error_cause
        }
      ].concat(state);
    case DISMISS_ERROR:
      if (state.length > 0) {
        return state.slice(1);
      }
      return state;
    default:
      return state;
  }
};

/**
 * Push an error onto the stack, for immediate display.
 * @param {!string} message
 * @returns {{type: string, message: string, error_type: string, error_cause: string}}
 */
exports.reportError = function(message, error_type, error_cause) {
  return {
    type: REPORT_ERROR,
    message: message,
    error_type: error_type,
    error_cause: error_cause
  };
};

/**
 * Remove the top (first) error from the stack.
 * @returns {{type: string}}
 */
exports.dismissError = function() {
  return {
    type: DISMISS_ERROR
  };
};
