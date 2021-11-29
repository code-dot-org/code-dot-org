import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {addMultipleAddRows} from './manageStudentsRedux';
import Button from '../Button';
import i18n from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import DialogFooter from '../teacherDashboard/DialogFooter';
import firehoseClient from '@cdo/apps/lib/util/firehose';

class AddMultipleStudents extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    // Provided by redux
    addMultipleStudents: PropTypes.func.isRequired
  };

  state = {
    isDialogOpen: false
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'add-students-button-click',
        data_json: JSON.stringify({
          sectionId: this.props.sectionId
        })
      },
      {includeUserId: true}
    );
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  add = () => {
    const value = this.refs.studentsTextBox.value;
    this.props.addMultipleStudents(value.split('\n'));
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'add-students-confirm',
        data_json: JSON.stringify({
          sectionId: this.props.sectionId
        })
      },
      {includeUserId: true}
    );
    this.closeDialog();
  };

  render() {
    return (
      <div>
        <Button
          __useDeprecatedTag
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
              __useDeprecatedTag
              text={i18n.dialogCancel()}
              onClick={this.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              __useDeprecatedTag
              text={i18n.done()}
              onClick={this.add}
              color={Button.ButtonColor.orange}
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
    paddingBottom: 20
  },
  textarea: {
    width: '75%'
  }
};

export default connect(
  state => ({}),
  dispatch => ({
    addMultipleStudents(names) {
      dispatch(addMultipleAddRows(names));
    }
  })
)(AddMultipleStudents);
