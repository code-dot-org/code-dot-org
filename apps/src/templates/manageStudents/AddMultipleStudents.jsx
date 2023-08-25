import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {addMultipleAddRows} from './manageStudentsRedux';
import Button from '../Button';
import i18n from '@cdo/locale';
import DCDO from '@cdo/apps/dcdo';
import BaseDialog from '../BaseDialog';
import DialogFooter from '../teacherDashboard/DialogFooter';
import firehoseClient from '@cdo/apps/lib/util/firehose';

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
      if (!!DCDO.get('family-name-features', false)) {
        const parts = line.split(',');
        const name = parts[0].trim();
        const familyName = parts.length > 1 ? parts[1].trim() : '';
        return {name, familyName};
      } else {
        return {name: line, familyName: ''};
      }
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
          <div>{i18n.addStudentsMultipleInstructions()}</div>
          <textarea
            rows="15"
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
};

export default connect(
  state => ({}),
  dispatch => ({
    addMultipleStudents(names) {
      dispatch(addMultipleAddRows(names));
    },
  })
)(AddMultipleStudents);
