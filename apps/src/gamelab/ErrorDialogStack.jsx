/** @file Renders error dialogs in sequence, given a stack of errors */
var React = require('react');
var actions = require('./errorDialogStackModule');
var connect = require('react-redux').connect;
var BaseDialog = require('../templates/BaseDialog.jsx');

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
      <BaseDialog isOpen useDeprecatedGlobalStyles handleClose={this.props.dismissError}>
        <h1>{this.props.errors[0].message}</h1>
      </BaseDialog>
    );
  }
});
module.exports = connect(
  function propsFromStore(state) {
    return {
      errors: state.errorDialogStack
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      dismissError: function () {
        dispatch(actions.dismissError());
      }
    };
  }
)(ErrorDialogStack);
