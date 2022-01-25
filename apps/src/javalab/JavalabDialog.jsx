import BaseDialog from '@cdo/apps/templates/BaseDialog';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
    closeButtonText: PropTypes.string
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
      closeButtonText
    } = this.props;
    return (
      <BaseDialog
        bodyClassName={className}
        isOpen={isOpen}
        handleClose={handleClose}
        style={{
          ...styles.dialog,
          ...(displayTheme === DisplayTheme.DARK && styles.darkDialog)
        }}
        useUpdatedStyles
        hideCloseButton
      >
        <div
          style={displayTheme === DisplayTheme.DARK ? styles.darkDialog : {}}
        >
          <div style={styles.message}>{message}</div>
          <div style={styles.buttons}>
            {closeButtonText && (
              <button
                type="button"
                style={{
                  ...styles.button,
                  ...(displayTheme === DisplayTheme.DARK
                    ? styles.darkButton
                    : styles.lightCancel)
                }}
                onClick={handleClose}
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
                    : styles.lightConfirm)
                }}
                onClick={handleConfirm}
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
    width: 500
  },
  darkDialog: {
    backgroundColor: color.dark_slate_gray,
    color: color.white
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  button: {
    textAlign: 'center',
    padding: '5px 16px 5px 16px',
    fontSize: 14
  },
  darkButton: {
    backgroundColor: color.darkest_gray,
    color: 'white'
  },
  lightConfirm: {
    backgroundColor: color.orange,
    color: color.white
  },
  lightCancel: {
    backgroundColor: color.lightest_gray,
    color: color.black
  },
  message: {
    whiteSpace: 'normal',
    lineHeight: '18px',
    padding: 12
  }
};
