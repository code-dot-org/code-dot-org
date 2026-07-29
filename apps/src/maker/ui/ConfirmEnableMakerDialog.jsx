import Alert from '@code-dot-org/component-library/alert';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Portal} from 'react-portal';

import msg from '@cdo/locale';

import styles from './confirm-enable-maker-dialog.module.scss';

export class ConfirmEnableMakerDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  render() {
    return (
      <CustomDialog
        aria-label={msg.enableMakerDialogTitle()}
        onClose={this.props.handleCancel}
        className={styles.dialog}
      >
        <MuiTypography variant="h2">
          {msg.enableMakerDialogTitle()}
        </MuiTypography>
        <div className={styles.content}>
          <MuiTypography id="dsco-dialog-description" variant="body2">
            {msg.enableMakerDialogDescription()}{' '}
            <Link href="/maker/setup" openInNewTab external>
              {msg.enableMakerDialogSetupPageLinkText()}
            </Link>
          </MuiTypography>
          <Alert
            text={msg.enableMakerDialogWarning()}
            type="warning"
            size="xs"
            className={styles.warning}
          />
        </div>
        <div className={styles.actions}>
          <div className={styles.confirmButtons}>
            <MuiButton
              variant="contained"
              color="primary"
              onClick={() => this.props.handleConfirm('microbit')}
            >
              {msg.useMicroBit()}
            </MuiButton>
            <MuiButton
              variant="contained"
              color="primary"
              onClick={() => this.props.handleConfirm('circuitPlayground')}
            >
              {msg.useCircuitPlayground()}
            </MuiButton>
          </div>
          <MuiButton
            variant="text"
            color="primary"
            onClick={this.props.handleCancel}
          >
            {msg.dialogCancel()}
          </MuiButton>
        </div>
      </CustomDialog>
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
      this.props.isOpen && (
        <Portal>
          <ConfirmEnableMakerDialog {...this.props} />
        </Portal>
      )
    );
  }
}
