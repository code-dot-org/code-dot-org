import PropTypes from 'prop-types';
import React, {Component} from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';

import {DisplayTheme} from './DisplayTheme';

export default class JavalabDialog extends Component {
  static propTypes = {
    className: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)).isRequired,
    handleConfirm: PropTypes.func,
    handleClose: PropTypes.func,
    // message could be a string or html
    message: PropTypes.any,
    confirmButtonText: PropTypes.string,
    closeButtonText: PropTypes.string,
    showSpinner: PropTypes.bool,
    disableButtons: PropTypes.bool,
  };

  render() {
    const {
      className,
      isOpen,
      handleClose,
      handleConfirm,
      displayTheme,
      message,
      confirmButtonText,
      closeButtonText,
      showSpinner,
      disableButtons,
    } = this.props;
    return (
      <BaseDialog
        bodyClassName={className}
        isOpen={isOpen}
        handleClose={handleClose}
        style={{
          ...styles.dialog,
          ...(displayTheme === DisplayTheme.DARK && styles.darkDialog),
        }}
        useUpdatedStyles
        hideCloseButton
      >
        <div
          style={displayTheme === DisplayTheme.DARK ? styles.darkDialog : {}}
        >
          <div style={styles.message}>{message}</div>
          <div style={styles.buttons}>
            {showSpinner && (
              <i className="fa fa-spin fa-spinner" style={styles.spinner} />
            )}
            {closeButtonText && (
              <button
                type="button"
                style={{
                  ...styles.button,
                  ...(displayTheme === DisplayTheme.DARK
                    ? styles.darkButton
                    : styles.lightCancel),
                }}
                onClick={handleClose}
                disabled={disableButtons}
              >
                {closeButtonText}
              </button>
            )}
            {confirmButtonText && (
              <button
                type="button"
                style={{
                  ...styles.button,
                  ...(displayTheme === DisplayTheme.DARK
                    ? styles.darkButton
                    : styles.lightConfirm),
                }}
                onClick={handleConfirm}
                disabled={disableButtons}
              >
                {confirmButtonText}
              </button>
            )}
          </div>
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    textAlign: 'left',
    padding: 20,
    color: color.black,
    width: 500,
  },
  darkDialog: {
    backgroundColor: color.dark_slate_gray,
    color: color.white,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '10px',
  },
  button: {
    textAlign: 'center',
    padding: '5px 16px 5px 16px',
    fontSize: 14,
  },
  darkButton: {
    backgroundColor: color.darkest_gray,
    color: 'white',
  },
  lightConfirm: {
    backgroundColor: color.orange,
    color: color.white,
  },
  lightCancel: {
    backgroundColor: color.lightest_gray,
    color: color.black,
  },
  message: {
    whiteSpace: 'normal',
    lineHeight: '18px',
    padding: 12,
  },
  spinner: {
    textAlign: 'center',
    fontSize: 16,
    padding: '10px',
  },
};
