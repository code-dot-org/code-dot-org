import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
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
  dialogContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dialogInput: {
    margin: 0
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
  lightRename: {
    backgroundColor: color.cyan,
    color: color.white
  },
  lightCancel: {
    backgroundColor: color.light_gray,
    color: color.black
  },
  label: {
    marginBottom: 0
  }
};

export default class FileRenameDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    filename: PropTypes.string,
    handleRename: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.textInput = null;
    this.setTextInputRef = element => {
      this.textInput = element;
    };
  }

  render() {
    const {
      isOpen,
      handleClose,
      handleRename,
      filename,
      isDarkMode
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
        <label
          htmlFor="filenameInput"
          style={{...styles.label, ...(isDarkMode && styles.darkDialog)}}
        >
          Rename the file
        </label>
        <div
          style={{
            ...styles.dialogContent,
            ...(isDarkMode && styles.darkDialog)
          }}
        >
          <input
            type="text"
            name="filenameInput"
            defaultValue={filename}
            ref={this.setTextInputRef}
            style={{
              ...styles.dialogInput,
              ...(isDarkMode && styles.darkDialog)
            }}
          />
          <div>
            <button
              type="button"
              style={{
                ...styles.button,
                ...(isDarkMode ? styles.darkButton : styles.lightRename)
              }}
              onClick={() => handleRename(this.textInput.value)}
            >
              Rename
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
