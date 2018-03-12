import React, {Component, PropTypes} from 'react';
import Button from '../Button';
import i18n from "@cdo/locale";
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  instructions: {
    marginTop: 20
  }
};

export default class AddMultipleStudents extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func,
  };

  state = {
    isDialogOpen: this.props.isDialogOpen,
  };

  render() {
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          isOpen={this.props.isDialogOpen}
          style={styles.dialog}
          uncloseable
        >
          <h2>{i18n.projectSharingDialogHeader()}</h2>
          <div>
            {i18n.projectSharingDialogInstructions1()}
          </div>
          <div style={styles.instructions}>
            {i18n.projectSharingDialogInstructions2()}
          </div>
          <DialogFooter>
            <Button
              text={i18n.dialogCancel()}
              onClick={this.props.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={i18n.projectSharingDialogButton()}
              onClick={()=> console.log("clicked!")}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}
