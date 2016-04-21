/** @file Renders error dialogs in sequence, given a stack of errors */
'use strict';

var Dialog = require('../templates/DialogComponent.jsx');

/**
 * Renders error dialogs in sequence, given a stack of errors.
 */
var ErrorDialogStack = React.createClass({
  propTypes: {
    errorStack: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    dismissError: React.PropTypes.func.isRequired
  },

  render: function () {
    if (this.props.errorStack.length === 0) {
      return null;
    }
    
    return (
      <Dialog isOpen handleClose={this.props.dismissError}>
        <h1>{this.props.errorStack[0].message}</h1>
      </Dialog>
    );
  }
});
module.exports = ErrorDialogStack;
