import BaseDialog from '@cdo/apps/templates/BaseDialog';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

export default class DeleteConfirmationDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    filename: PropTypes.string
  };

  render() {
    const {
      isOpen,
      handleClose,
      handleConfirm,
      isDarkMode,
      filename
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
          <div>{`Are you sure you want to delete ${filename}?`}</div>
          <div style={styles.buttons}>
            <button
              type="button"
              style={{
                ...styles.button,
                ...(isDarkMode ? styles.darkButton : styles.lightConfirm)
              }}
              onClick={handleConfirm}
            >
              Delete
            </button>
            <button
              type="button"
              style={{
                ...styles.button,
                ...(isDarkMode ? styles.darkButton : styles.lightCancel)
              }}
              onClick={handleClose}
            >
              Cancel
            </button>
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
  }
};
