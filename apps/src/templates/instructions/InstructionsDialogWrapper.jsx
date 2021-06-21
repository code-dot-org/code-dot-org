import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

/**
 * A component for managing our instructions dialog. Right now the entirety of
 * the actual content is managed by showInstructionsDialog rather than this
 * component, with this component just determining when we should show the
 * dialog (based on redux state).
 * Long term we could start moving some/all of the logic in showInstructionsDialog
 * into this component, though we're moving towards getting rid of this dialog
 * anyways.
 */
export class UnwrappedInstructionsDialogWrapper extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    autoClose: PropTypes.bool,
    showInstructionsDialog: PropTypes.func.isRequired
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) {
      this.props.showInstructionsDialog(nextProps.autoClose);
    }
  }

  render() {
    return null;
  }
}

export default connect(state => ({
  isOpen: state.instructionsDialog.open,
  autoClose: state.instructionsDialog.autoClose
}))(UnwrappedInstructionsDialogWrapper);
