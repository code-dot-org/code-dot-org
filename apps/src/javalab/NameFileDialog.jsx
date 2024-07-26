import PropTypes from 'prop-types';
import React, {Component} from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';

import {DisplayTheme} from './DisplayTheme';

export default class NameFileDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    inputLabel: PropTypes.string.isRequired,
    saveButtonText: PropTypes.string.isRequired,
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)).isRequired,
    errorMessage: PropTypes.string,
    filename: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.textInput = null;
    this.setTextInputRef = element => {
      this.textInput = element;
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.textInput.focus();
      this.textInput.setSelectionRange(0, 0);
    }
  }

  onKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.props.handleSave(this.textInput.value);
    }
  };

  render() {
    const {
      isOpen,
      handleClose,
      handleSave,
      inputLabel,
      saveButtonText,
      displayTheme,
      errorMessage,
      filename,
    } = this.props;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={handleClose}
        style={{
          ...styles.dialog,
          ...(displayTheme === DisplayTheme.DARK && styles.darkDialog),
        }}
        useUpdatedStyles
        hideCloseButton
      >
        <label
          htmlFor="filenameInput"
          style={{
            ...styles.label,
            ...(displayTheme === DisplayTheme.DARK && styles.darkDialog),
          }}
        >
          {inputLabel}
        </label>
        <div
          style={{
            ...styles.dialogContent,
            ...(displayTheme === DisplayTheme.DARK && styles.darkDialog),
          }}
        >
          <input
            type="text"
            name="filenameInput"
            defaultValue={filename}
            ref={this.setTextInputRef}
            style={{
              ...styles.dialogInput,
              ...(displayTheme === DisplayTheme.DARK && styles.darkDialog),
            }}
            onKeyDown={this.onKeyDown}
          />
          <div>
            <button
              type="button"
              style={{
                ...styles.button,
                ...(displayTheme === DisplayTheme.DARK
                  ? styles.darkButton
                  : styles.lightSave),
              }}
              onClick={() => handleSave(this.textInput.value)}
            >
              {saveButtonText}
            </button>
            <button
              type="button"
              style={{
                ...styles.button,
                ...(displayTheme === DisplayTheme.DARK
                  ? styles.darkButton
                  : styles.lightCancel),
              }}
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
        {errorMessage && (
          <div
            style={
              displayTheme === DisplayTheme.DARK
                ? styles.darkErrorMessage
                : styles.errorMessage
            }
          >
            {errorMessage}
          </div>
        )}
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
  dialogContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogInput: {
    margin: 0,
  },
  button: {
    width: 100,
    textAlign: 'center',
    padding: 6,
  },
  darkButton: {
    backgroundColor: color.darkest_gray,
    color: 'white',
  },
  lightSave: {
    backgroundColor: color.cyan,
    color: color.white,
  },
  lightCancel: {
    backgroundColor: color.light_gray,
    color: color.black,
  },
  label: {
    marginBottom: 0,
  },
  errorMessage: {
    color: color.red,
  },
  darkErrorMessage: {
    backgroundColor: color.dark_slate_gray,
    color: color.lightest_red,
  },
};
