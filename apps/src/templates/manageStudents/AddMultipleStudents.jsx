import Papa from 'papaparse';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import experiments from '@cdo/apps/util/experiments';
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
    if (this.fileInput) {
      this.fileInput.click();
    }
  };

  removeSelectedFile = () => {
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    this.setState({fileName: null, selectedFile: null});
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
    if (experiments.isEnabled('add-students-csv-import')) {
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
    } else {
      const value = this.refs.studentsTextBox.value;
      const studentDataArray = value.split('\n').map(line => {
        const parts = line.split(',');
        const name = parts[0].trim();
        const familyName = parts.length > 1 ? parts[1].trim() : null;
        return {name, familyName};
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
          {experiments.isEnabled('add-students-csv-import') ? (
            <div>{i18n.addStudentsMultipleInstructions()}</div>
          ) : (
            <div>{i18n.addStudentsMultipleWithFamilyNameInstructions()}</div>
          )}
          {experiments.isEnabled('add-students-csv-import') ? (
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
                <label htmlFor="students-csv-file-input">
                  {i18n.addStudentsImportLabel()}
                </label>
                <input
                  id="students-csv-file-input"
                  type="file"
                  accept=".csv"
                  ref={input => (this.fileInput = input)}
                  style={styles.hiddenFileInput}
                  onChange={this.onFileUpload}
                  aria-label={i18n.addStudentsImportLabel()}
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
                >
                  {this.state.fileName ? (
                    <div style={styles.fileSelected}>
                      <button
                        type="button"
                        style={styles.fileNameButton}
                        onClick={this.onImportCSV}
                        aria-label={
                          `${this.state.fileName}. ` +
                          i18n.importFromCSVDragBrowse()
                        }
                      >
                        <span style={styles.fileName}>
                          {this.state.fileName}
                        </span>
                      </button>
                      <button
                        type="button"
                        style={styles.removeFile}
                        aria-label={`${i18n.dialogRemove()} ${
                          this.state.fileName
                        }`}
                        onClick={this.removeSelectedFile}
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      style={styles.dropZoneButton}
                      onClick={this.onImportCSV}
                    >
                      {i18n.importFromCSVDragBrowse()}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <textarea
              rows="15"
              cols="70"
              ref="studentsTextBox"
              style={styles.textarea}
              aria-label={i18n.addStudentsMultiple()}
            />
          )}
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
    marginTop: 4,
    marginBottom: 0,
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
  dropZoneButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    flex: 1,
    fontSize: 14,
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    textAlign: 'center',
    width: '100%',
  },
  fileNameButton: {
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    margin: 0,
    minWidth: 0,
    padding: 0,
  },
  fileName: {
    color: '#333',
    display: 'block',
    textAlign: 'center',
    fontSize: 14,
    wordBreak: 'break-all',
  },
  fileSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeFile: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    fontSize: 24,
    lineHeight: 1,
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
