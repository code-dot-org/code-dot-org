import BaseDialog from '@cdo/apps/templates/BaseDialog';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

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
  button: {
    width: 100,
    textAlign: 'center',
    padding: 6
  },
  darkButton: {
    backgroundColor: color.darkest_gray,
    color: 'white'
  }
};

export default class DeleteConfirmationDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    filename: PropTypes.string.isRequired
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
        <div>{`Are you sure you want to delete ${filename}?`}</div>
        <div>
          <button
            type="button"
            style={{
              ...styles.button,
              ...(isDarkMode ? styles.darkButton : styles.lightRename)
            }}
            onClick={handleConfirm}
          >
            Yes, delete the file
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
      </BaseDialog>
    );
  }
}
