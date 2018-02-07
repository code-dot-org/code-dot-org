import React, {Component, PropTypes} from 'react';
import QuickActionsCell from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import Button from '../Button';
import {startEditingStudent, cancelEditingStudent, removeStudent, saveStudent} from './manageStudentsRedux';
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
    isSaving: PropTypes.bool,
    disableSaving: PropTypes.bool,
    // Provided by redux
    startEditingStudent: PropTypes.func,
    cancelEditingStudent: PropTypes.func,
    removeStudent: PropTypes.func,
    saveStudent: PropTypes.func,
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
  };

  onEdit = () => {
    this.props.startEditingStudent(this.props.id);
  };

  onCancel = () => {
    this.props.cancelEditingStudent(this.props.id);
  };

  onSave = () => {
    this.props.saveStudent(this.props.id);
  };

  render() {
    return (
      <div>
        {!this.props.isEditing &&
          <QuickActionsCell>
            <PopUpMenu.Item
              onClick={this.onEdit}
            >
              {i18n.edit()}
            </PopUpMenu.Item>
            <MenuBreak/>
            <PopUpMenu.Item
              onClick={this.onRequestDelete}
              color={color.red}
            >
              <FontAwesome icon="times-circle" style={styles.xIcon}/>
              {i18n.removeStudent()}
            </PopUpMenu.Item>
          </QuickActionsCell>
        }
        {this.props.isEditing &&
          <div>
            <Button
              onClick={this.onSave}
              color={Button.ButtonColor.white}
              text={i18n.save()}
              disabled={this.props.isSaving || this.props.disableSaving}
            />
            <Button
              onClick={this.onCancel}
              color={Button.ButtonColor.blue}
              text={i18n.cancel()}
            />
          </div>
        }
        <BaseDialog
          useUpdatedStyles
          uncloseable
          isOpen={this.state.deleting}
          style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 20}}
        >
          <h2 style={styles.heading}>{i18n.removeStudent()}</h2>
          <div>{i18n.removeStudentConfirm()}</div>
          <DialogFooter>
            <Button
              text={i18n.dialogCancel()}
              onClick={this.onCancelDelete}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={i18n.removeStudent()}
              onClick={this.onConfirmDelete}
              color={Button.ButtonColor.red}
              disabled={this.state.requestInProgress}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

export const UnconnectedManageStudentActionsCell = ManageStudentActionsCell;

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
  saveStudent(id) {
    dispatch(saveStudent(id));
  },
}))(ManageStudentActionsCell);
