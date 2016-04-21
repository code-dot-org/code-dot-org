/** @file Renders error dialogs in sequence, given a stack of errors */
'use strict';

var connect = require('react-redux').connect;
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

/** Provide a connected version for general use. */
ErrorDialogStack.ConnectedErrorDialogStack = connect(
  function propsFromStore(state) {
    return {
      errors: state.errorDialogStack
    }
  },
  function propsFromDispatch(dispatch) {
    return {
      dismissError: function () {
        dispatch(ErrorDialogStack.actions.dismissError())
      }
    }
  }
)(ErrorDialogStack);

ErrorDialogStack.actions = {};
var REPORT_ERROR = 'ErrorDialogStack/REPORT_ERROR';
var DISMISS_ERROR = 'ErrorDialogStack/DISMISS_ERROR';

ErrorDialogStack.reducer = function errorDialogStack(state, action) {
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
ErrorDialogStack.actions.reportError = function (message) {
  return {
    type: REPORT_ERROR,
    message: message
  };
};

/**
 * Remove the top (first) error from the stack.
 * @returns {{type: string}}
 */
ErrorDialogStack.actions.dismissError = function () {
  return {
    type: DISMISS_ERROR
  };
};
