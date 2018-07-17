import React, {Component, PropTypes} from 'react';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from "@cdo/apps/templates/teacherDashboard/DialogFooter";

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

export default class FreeResponseDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    questionText: PropTypes.string,
  };

  state = {
    isDialogOpen: this.props.isDialogOpen,
  };

  handleYesClick = () => {
    this.setState({isDialogOpen: false});
  };

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isDialogOpen}
        style={styles.dialog}
      >
        <h2>{"Question details"}</h2>
        <div style={styles.instructions}>
          {this.props.questionText}
        </div>
        <DialogFooter>
          <Button
            text={"Done"}
            onClick={this.handleYesClick}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
