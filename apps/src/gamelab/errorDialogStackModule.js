/** @file Redux actions and reducer for the Error Dialog Stack component */
'use strict';

var REPORT_ERROR = 'ErrorDialogStack/REPORT_ERROR';
var DISMISS_ERROR = 'ErrorDialogStack/DISMISS_ERROR';

exports.default = function reducer(state, action) {
  state = state || [];
  switch (action.type) {
    case REPORT_ERROR:
      return [{
        message: action.message
      }].concat(state);
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
 * @returns {{type: string, message: string}}
 */
exports.reportError = function (message) {
  return {
    type: REPORT_ERROR,
    message: message
  };
};

/**
 * Remove the top (first) error from the stack.
 * @returns {{type: string}}
 */
exports.dismissError = function () {
  return {
    type: DISMISS_ERROR
  };
};
