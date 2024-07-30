import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

import BaseDialog from '../BaseDialog';
import DialogFooter from '../teacherDashboard/DialogFooter';

import {addMultipleAddRows} from './manageStudentsRedux';

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
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'add-students-button-click',
        data_json: JSON.stringify({
          sectionId: this.props.sectionId,
        }),
      },
      {includeUserId: true}
    );
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  add = () => {
    const value = this.refs.studentsTextBox.value;
    const studentDataArray = value.split('\n').map(line => {
      const parts = line.split(',');
      const name = parts[0].trim();
      const familyName = parts.length > 1 ? parts[1].trim() : null;
      return {name, familyName};
    });
    this.props.addMultipleStudents(studentDataArray);
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'add-students-confirm',
        data_json: JSON.stringify({
          sectionId: this.props.sectionId,
        }),
      },
      {includeUserId: true}
    );
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
          <div>{i18n.addStudentsMultipleWithFamilyNameInstructions()}</div>
          <textarea
            rows="15"
            cols="70"
            ref="studentsTextBox"
            style={styles.textarea}
            aria-label={i18n.addStudentsMultiple()}
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
};

export default connect(
  state => ({}),
  dispatch => ({
    addMultipleStudents(names) {
      dispatch(addMultipleAddRows(names));
    },
  })
)(AddMultipleStudents);
