import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

/**
 * This component is deprecated and should not be used. Its only current usage is in StudioApp.js,
 * but multiple apps/scenarios need to be migrated before we can remove this component.
 * Any new consumers should use apps/src/templates/instructions/InstructionsDialog.jsx instead.
 *
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

  componentDidMount() {
    if (this.props.isOpen) {
      this.props.showInstructionsDialog(this.props.autoClose);
    }
  }

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
