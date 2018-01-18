import React, {Component, PropTypes} from 'react';
import QuickActionsCell from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import Button from '../Button';
import {startEditingStudent, cancelEditingStudent, removeStudent} from './manageStudentsRedux';
import {connect} from 'react-redux';
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";
import i18n from '@cdo/locale';

const styles = {
  xIcon: {
    paddingRight: 5,
  }
};

class ManageStudentActionsCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    isEditing: PropTypes.bool,
    // Provided by redux
    startEditingStudent: PropTypes.func,
    cancelEditingStudent: PropTypes.func,
    removeStudent: PropTypes.func,
  };

  state = {
    deleting: false,
    requestInProgress: false,
  };

  onConfirmDelete = () => {
      const {removeStudent, id, sectionId} = this.props;
      this.setState({requestInProgress: true});
      $.ajax({
          url: `/v2/sections/${sectionId}/students/${id}`,
          method: 'DELETE',
      }).done(() => {
          removeStudent(id);
      }).fail((jqXhr, status) => {
          // We may want to handle this more cleanly in the future, but for now this
          // matches the experience we got in angular
          alert(i18n.unexpectedError());
          console.error(status);
      });
  };

  onRequestDelete = () => {
    this.setState({deleting: true});
  };

  onCancelDelete = () => {
    this.setState({deleting: false});
  }

  onEdit = () => {
    this.props.startEditingStudent(this.props.id);
  };

  onCancel = () => {
    this.props.cancelEditingStudent(this.props.id);
  };

  render() {
    return (
      <div>
        {!this.props.isEditing &&
          <QuickActionsCell>
            <PopUpMenu.Item
              onClick={this.onEdit}
            >
              Edit
            </PopUpMenu.Item>
            <MenuBreak/>
            <PopUpMenu.Item
              onClick={this.onRequestDelete}
              color={color.red}
            >
              <FontAwesome icon="times-circle" style={styles.xIcon}/>
              Remove student
            </PopUpMenu.Item>
          </QuickActionsCell>
        }
        {this.props.isEditing &&
          <div>
            <Button onClick={() => {}} color={Button.ButtonColor.white} text="Save" />
            <Button onClick={this.onCancel} color={Button.ButtonColor.blue} text="Cancel" />
          </div>
        }
        <BaseDialog
          useUpdatedStyles
          uncloseable
          isOpen={this.state.deleting}
          style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 20}}
        >
          <h2 style={styles.heading}>Remove student</h2>
          <div>Are you sure you want to remove this student?</div>
          <DialogFooter>
            <Button
              class="ui-test-cancel-delete"
              text={i18n.dialogCancel()}
              onClick={this.onCancelDelete}
              color="gray"
            />
            <Button
              class="ui-test-confirm-delete"
              text="Remove student"
              onClick={this.onConfirmDelete}
              color="red"
              disabled={this.state.requestInProgress}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

export default connect(state => ({}), dispatch => ({
  startEditingStudent(id) {
    dispatch(startEditingStudent(id));
  },
  cancelEditingStudent(id) {
    dispatch(cancelEditingStudent(id));
  },
  removeStudent(id) {
    dispatch(removeStudent(id));
  },
}))(ManageStudentActionsCell);
