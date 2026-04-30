import Papa from 'papaparse';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import BaseDialog from '../BaseDialog';
import DialogFooter from '../teacherDashboard/DialogFooter';

import {
  addMultipleAddRows,
  parseAge,
  parseGender,
  parseUsState,
} from './manageStudentsRedux';

class AddMultipleStudents extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    // Provided by redux
    addMultipleStudents: PropTypes.func.isRequired,
  };

  state = {
    isDialogOpen: false,
    fileName: null,
    selectedFile: null,
    isDragging: false,
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({
      isDialogOpen: false,
      fileName: null,
      selectedFile: null,
      isDragging: false,
    });
    if (this.fileInput) {
      this.fileInput.value = '';
    }
  };

  onImportCSV = () => {
    this.fileInput.click();
  };

  onFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    this.setState({fileName: file.name, selectedFile: file});
  };

  onDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({isDragging: true});
  };

  onDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({isDragging: false});
  };

  onDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({isDragging: false});
    const file = e.dataTransfer.files[0];
    if (!file) return;
    this.setState({fileName: file.name, selectedFile: file});
  };

  add = () => {
    if (this.state.selectedFile) {
      Papa.parse(this.state.selectedFile, {
        complete: results => {
          const studentDataArray = results.data.map(parts => {
            const name = (parts[0] || '').trim();
            const familyName = (parts[1] || '').trim() || null;
            const age = parseAge(parts[2]);
            const gender = parseGender(parts[3]);
            const usState = parseUsState(parts[4]) || null;
            return {name, familyName, age, gender, usState};
          });
          this.props.addMultipleStudents(studentDataArray);
          this.setState({fileName: null, selectedFile: null});
          this.closeDialog();
        },
        error: () => {
          console.error('CSV parse error');
        },
      });
    } else {
      const value = this.refs.studentsTextBox.value;
      const results = Papa.parse(value);
      const studentDataArray = results.data.map(parts => {
        const name = (parts[0] || '').trim();
        const familyName = (parts[1] || '').trim() || null;
        const age = parseAge(parts[2]);
        const gender = parseGender(parts[3]);
        const usState = parseUsState(parts[4]) || null;
        return {name, familyName, age, gender, usState};
      });
      this.props.addMultipleStudents(studentDataArray);
      this.closeDialog();
    }
  };

  render() {
    return (
      <div>
        <Button
          style={styles.button}
          onClick={this.openDialog}
          color={Button.ButtonColor.gray}
          text={i18n.addStudentsMultiple()}
          icon="plus"
        />
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          handleClose={this.closeDialog}
        >
          <h2>{i18n.addStudentsMultiple()}</h2>
          <div>{i18n.addStudentsMultipleInstructions()}</div>
          <div style={styles.inputRow}>
            <div style={styles.textareaSection}>
              <label htmlFor="students-text-box">
                {i18n.addStudentsTypeLabel()}
              </label>
              <textarea
                id="students-text-box"
                rows="8"
                cols="35"
                ref="studentsTextBox"
                style={{
                  ...styles.textarea,
                  ...(this.state.selectedFile ? styles.textareaDisabled : {}),
                }}
                disabled={!!this.state.selectedFile}
              />
            </div>
            <div style={styles.dividerSection}>
              <div style={styles.verticalDivider} />
              <div style={styles.orLabel}>{i18n.or()}</div>
              <div style={styles.verticalDivider} />
            </div>
            <div style={styles.dropSection}>
              <label>{i18n.addStudentsImportLabel()}</label>
              <input
                type="file"
                accept=".csv"
                ref={input => (this.fileInput = input)}
                style={styles.hiddenFileInput}
                onChange={this.onFileUpload}
              />
              <div
                style={{
                  ...styles.dropZone,
                  ...(this.state.isDragging ? styles.dropZoneActive : {}),
                  ...(this.state.selectedFile ? styles.dropZoneHasFile : {}),
                }}
                onDragOver={this.onDragOver}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}
                onClick={this.onImportCSV}
              >
                {this.state.fileName ? (
                  <div style={styles.fileSelected}>
                    <div style={styles.fileName}>{this.state.fileName}</div>
                    <button
                      style={styles.removeFile}
                      onClick={e => {
                        e.stopPropagation();
                        this.fileInput.value = '';
                        this.setState({fileName: null, selectedFile: null});
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={styles.dropPrompt}>
                    Drag a CSV file here, or click to browse
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              style={styles.button}
              text={i18n.dialogCancel()}
              onClick={this.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              style={styles.button}
              text={i18n.done()}
              onClick={this.add}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  button: {
    margin: 0,
    marginBottom: 5,
  },
  hiddenFileInput: {
    display: 'none',
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    paddingTop: 10,
  },
  textareaSection: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxWidth: '80%',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '100%',
  },
  textareaDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  dividerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verticalDivider: {
    flex: 1,
    width: 1,
    background: '#e7e8ea',
  },
  orLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  dropSection: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  dropZone: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e7e8ea',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 10,
    marginTop: 4,
  },
  dropZoneHasFile: {
    borderColor: '#333',
    borderStyle: 'solid',
  },
  dropZoneActive: {
    borderColor: '#7765a0',
    background: '#f0eef5',
  },
  dropPrompt: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  fileName: {
    color: '#333',
    textAlign: 'center',
    fontSize: 14,
    wordBreak: 'break-all',
  },
  fileSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  removeFile: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    fontSize: 14,
    padding: 0,
  },
};

export default connect(
  state => ({}),
  dispatch => ({
    addMultipleStudents(names) {
      dispatch(addMultipleAddRows(names));
    },
  })
)(AddMultipleStudents);
