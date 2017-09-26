/** @file Renders error dialogs in sequence, given a stack of errors */
import React, {PropTypes} from 'react';
import * as actions from './errorDialogStackModule';
import {connect} from 'react-redux';
import BaseDialog from '../templates/BaseDialog.jsx';

/**
 * Renders error dialogs in sequence, given a stack of errors.
 */
class ErrorDialogStack extends React.Component {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.object).isRequired,
    dismissError: PropTypes.func.isRequired
  };

  render() {
    if (this.props.errors.length === 0) {
      return null;
    }

    return (
      <BaseDialog isOpen useDeprecatedGlobalStyles handleClose={this.props.dismissError}>
        <h1>{this.props.errors[0].message}</h1>
      </BaseDialog>
    );
  }
}
export default connect(
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
