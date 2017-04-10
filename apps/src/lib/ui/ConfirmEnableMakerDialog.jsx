import React, {Component, PropTypes} from 'react';
import Portal from 'react-portal';
import msg from '@cdo/locale';
import Dialog, {Title, Body} from '../../templates/Dialog';

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
        confirmText={msg.enable()}
        onConfirm={this.props.handleConfirm}
        cancelText={msg.dialogCancel()}
        onCancel={this.props.handleCancel}
        handleClose={this.props.handleCancel}
      >
        <Title>{msg.enableMakerDialogTitle()}</Title>
        <Body>
          <p>
            {msg.enableMakerDialogBody()}
          </p>
          <ul>
            <li>
              <a href="/maker/setup" target="_blank">
                {msg.enableMakerDialogSetupPageLinkText()}
              </a>
            </li>
          </ul>
        </Body>
      </Dialog>
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
