/** @file Renders error dialogs in sequence, given a stack of errors */
'use strict';

var Dialog = require('../templates/DialogComponent.jsx');

/**
 * Renders error dialogs in sequence, given a stack of errors.
 */
var ErrorDialogStack = React.createClass({
  propTypes: {
    errors: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    dismissError: React.PropTypes.func.isRequired
  },

  render: function () {
    if (this.props.errors.length === 0) {
      return null;
    }
    
    return (
      <Dialog isOpen handleClose={this.props.dismissError}>
        <h1>{this.props.errors[0].message}</h1>
      </Dialog>
    );
  }
});
module.exports = ErrorDialogStack;

/** @enum {string} */
var ActionType = module.exports.ActionType = {
  'REPORT_ERROR': 'REPORT_ERROR',
  'DISMISS_ERROR': 'DISMISS_ERROR'
};

module.exports.actions = {};

/**
 * Push an error onto the stack, for immediate display.
 * @param {!string} message
 * @returns {{type: ActionType, message: string}}
 */
module.exports.actions.reportError = function (message) {
  return {
    type: ActionType.REPORT_ERROR,
    message: message
  };
};

/**
 * Remove the top (first) error from the stack.
 * @returns {{type: ActionType}}
 */
module.exports.actions.dismissError = function () {
  return {
    type: ActionType.DISMISS_ERROR
  };
};

module.exports.reducer = function errorDialogStack(state, action) {
  state = state || [];
  switch (action.type) {
    case ActionType.REPORT_ERROR:
      return [{
        message: action.message
      }].concat(state);
    case ActionType.DISMISS_ERROR:
      if (state.length > 0) {
        return state.slice(1);
      }
      return state;
    default:
      return state;
  }
};
