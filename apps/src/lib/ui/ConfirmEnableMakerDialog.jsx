import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Portal from 'react-portal';
import msg from '@cdo/locale';
import color from '../../util/color';
import Dialog, {Title, Body} from '../../templates/Dialog';

const style = {
  description: {
    fontSize: 'smaller'
  },
  warning: {
    color: color.red,
    fontSize: 'smaller',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10
  }
};

export class ConfirmEnableMakerDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired
  };

  render() {
    return (
      <Dialog
        isOpen={this.props.isOpen}
        confirmText={msg.enable()}
        onConfirm={this.props.handleConfirm}
        onCancel={this.props.handleCancel}
        handleClose={this.props.handleCancel}
      >
        <Title>{msg.enableMakerDialogTitle()}</Title>
        <Body>
          <div style={style.description}>
            {msg.enableMakerDialogDescription()}{' '}
            <a href="/maker/setup" target="_blank">
              {msg.enableMakerDialogSetupPageLinkText()}
            </a>
          </div>
          <div style={style.warning}>{msg.enableMakerDialogWarning()}</div>
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
        <ConfirmEnableMakerDialog {...this.props} />
      </Portal>
    );
  }
}
