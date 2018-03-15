import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {addMultipleAddRows} from './manageStudentsRedux';
import Button from '../Button';
import i18n from "@cdo/locale";
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

class AddMultipleStudents extends Component {
  static propTypes = {
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

  add = () => {
    const value = this.refs.studentsTextBox.value;
    this.props.addMultipleStudents(value.split("\n"));
    this.closeDialog();
  };

  render() {
    return (
      <div>
        <Button
          onClick={this.openDialog}
          color={Button.ButtonColor.gray}
          text={i18n.addStudentsMultiple()}
        />
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          handleClose={this.closeDialog}
        >
          <h2>{i18n.addStudentsMultiple()}</h2>
          <div>
            {i18n.addStudentsMultipleInstructions()}
          </div>
          <textarea name="textarea" rows="15" cols="70" ref="studentsTextBox">
          </textarea>
          <DialogFooter>
            <Button
              text={i18n.dialogCancel()}
              onClick={this.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
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

export default connect(state => ({}), dispatch => ({
  addMultipleStudents(names) {
    dispatch(addMultipleAddRows(names));
  },
}))(AddMultipleStudents);
