import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';

export default class NameFileDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    inputLabel: PropTypes.string.isRequired,
    saveButtonText: PropTypes.string.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
    filename: PropTypes.string
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
      handleSave,
      inputLabel,
      saveButtonText,
      isDarkMode,
      errorMessage,
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
        <label
          htmlFor="filenameInput"
          style={{...styles.label, ...(isDarkMode && styles.darkDialog)}}
        >
          {inputLabel}
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
                ...(isDarkMode ? styles.darkButton : styles.lightSave)
              }}
              onClick={() => handleSave(this.textInput.value)}
            >
              {saveButtonText}
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
        {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
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
  lightSave: {
    backgroundColor: color.cyan,
    color: color.white
  },
  lightCancel: {
    backgroundColor: color.light_gray,
    color: color.black
  },
  label: {
    marginBottom: 0
  },
  errorMessage: {
    color: color.red
  }
};
