import BaseDialog from '@cdo/apps/templates/BaseDialog';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

export default class JavalabDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func,
    message: PropTypes.string,
    confirmButtonText: PropTypes.string,
    closeButtonText: PropTypes.string
  };

  render() {
    const {
      isOpen,
      handleClose,
      handleConfirm,
      isDarkMode,
      message,
      confirmButtonText,
      closeButtonText
    } = this.props;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={handleClose}
        style={{
          ...styles.dialog,
          ...(isDarkMode && styles.darkDialog)
        }}
        useUpdatedStyles
        hideCloseButton
      >
        <div
          style={{
            ...styles.dialogContent,
            ...(isDarkMode && styles.darkDialog)
          }}
        >
          <div style={styles.message}>{message}</div>
          <div style={styles.buttons}>
            {confirmButtonText && (
              <button
                type="button"
                style={{
                  ...styles.button,
                  ...(isDarkMode ? styles.darkButton : styles.lightConfirm)
                }}
                onClick={handleConfirm}
              >
                {confirmButtonText}
              </button>
            )}
            {closeButtonText && (
              <button
                type="button"
                style={{
                  ...styles.button,
                  ...(isDarkMode ? styles.darkButton : styles.lightCancel)
                }}
                onClick={handleClose}
              >
                {closeButtonText}
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
  dialogContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buttons: {
    display: 'flex'
  },
  button: {
    width: 100,
    textAlign: 'center',
    padding: 6
  },
  darkButton: {
    backgroundColor: color.darkest_gray,
    color: 'white'
  },
  lightConfirm: {
    backgroundColor: color.cyan,
    color: color.white
  },
  lightCancel: {
    backgroundColor: color.light_gray,
    color: color.black
  },
  message: {
    whiteSpace: 'normal',
    lineHeight: '18px'
  }
};
