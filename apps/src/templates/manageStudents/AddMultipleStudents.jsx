import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Papa from 'papaparse';

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
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  onImportCSV = () => {
    this.fileInput.click();
  };

  onFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: results => {
        const text = results.data.map(row => row.join(',')).join('\n');
        this.refs.studentsTextBox.value = text;
        this.fileInput.value = '';
      },
    });
  };

  // Column order: DisplayName, FamilyName, Age, Gender, State
  add = () => {
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
          <hr style={styles.divider} />
          <input
            type="file"
            accept=".csv"
            ref={input => (this.fileInput = input)}
            style={styles.hiddenFileInput}
            onChange={this.onFileUpload}
          />
          <div style={styles.textareaHeader}>
            <label htmlFor="students-text-box">
              {i18n.addStudentsTypeLabel()}
            </label>
            <Button
              style={styles.button}
              text={i18n.importFromCSV()}
              onClick={this.onImportCSV}
              color={Button.ButtonColor.gray}
              icon="upload"
            />
          </div>
          <textarea
            id="students-text-box"
            rows="8"
            cols="70"
            ref="studentsTextBox"
            style={styles.textarea}
          />
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
  textarea: {
    width: '75%',
  },
  button: {
    margin: 0,
    marginBottom: 5,
  },
  hiddenFileInput: {
    display: 'none',
  },
  divider: {
    borderTop: '1px solid #e7e8ea',
    margin: '10px 0',
  },
  textareaHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 5,
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
