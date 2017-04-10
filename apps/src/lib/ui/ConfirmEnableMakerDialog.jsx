import React, {Component, PropTypes} from 'react';
import Portal from 'react-portal';
import Dialog from '../../templates/Dialog';

export class ConfirmEnableMakerDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  render() {
    return (
      <Dialog
        isOpen={this.props.isOpen}
        title="Enable Maker Toolkit?"
        body="This is a new feature that requires access to a Circuit Playground board."
        confirmText="Enable"
        onConfirm={this.props.handleConfirm}
        cancelText="Cancel"
        onCancel={this.props.handleCancel}
        handleClose={this.props.handleCancel}
      />
    );
  }
}

// Our default export is actually a wrapper around our dialog that renders it
// through a Portal component so it sits at the end of the DOM instead of
// inside whatever component called for it - but this is lousy for testing,
// so we mostly export and test the inner dialog component.
export default class ConfirmEnableMakerDialogPortal extends Component {
  static propTypes = ConfirmEnableMakerDialog.propTypes;
  render() {
    return (
      <Portal isOpened={this.props.isOpen}>
        <ConfirmEnableMakerDialog {...this.props}/>
      </Portal>
    );
  }
}
