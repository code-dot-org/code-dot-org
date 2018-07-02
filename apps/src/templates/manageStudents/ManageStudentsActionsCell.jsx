import React, {Component, PropTypes} from 'react';
import QuickActionsCell from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import Button from '../Button';
import {startEditingStudent, cancelEditingStudent, removeStudent, saveStudent, addStudents, RowType} from './manageStudentsRedux';
import {connect} from 'react-redux';
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

const styles = {
  xIcon: {
    paddingRight: 5,
  },
  saveButton: {
    marginRight: 5,
  }
};

class ManageStudentActionsCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number,
    isEditing: PropTypes.bool,
    isSaving: PropTypes.bool,
    disableSaving: PropTypes.bool,
    rowType: PropTypes.oneOf(Object.values(RowType)),
    loginType: PropTypes.string,
    // Provided by redux
    startEditingStudent: PropTypes.func,
    cancelEditingStudent: PropTypes.func,
    removeStudent: PropTypes.func,
    saveStudent: PropTypes.func,
    addStudent: PropTypes.func,
  };

  state = {
    deleting: false,
    requestInProgress: false,
  };

  onConfirmDelete = () => {
    const {removeStudent, id, sectionId} = this.props;
    this.setState({requestInProgress: true});
    $.ajax({
        url: `/dashboardapi/sections/${sectionId}/students/${id}/remove`,
        method: 'POST',
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
    if (this.props.rowType === RowType.NEW_STUDENT) {
      this.props.removeStudent(this.props.id);
    } else {
      this.props.cancelEditingStudent(this.props.id);
    }
  };

  onSave = () => {
    if (this.props.rowType === RowType.NEW_STUDENT) {
      this.onAdd();
    } else {
      this.props.saveStudent(this.props.id);
    }
  };

  onAdd = () => {
    this.props.addStudent(this.props.id);
  };

  render() {
    const {rowType, isEditing, loginType} = this.props;
    const canDelete = [SectionLoginType.word, SectionLoginType.picture, SectionLoginType.email].includes(loginType);
    return (
      <div>
        {!isEditing &&
          <QuickActionsCell>
            <PopUpMenu.Item
              onClick={this.onEdit}
            >
              {i18n.edit()}
            </PopUpMenu.Item>
            {canDelete &&
              <MenuBreak/>
            }
            {canDelete &&
              <PopUpMenu.Item
                onClick={this.onRequestDelete}
                color={color.red}
              >
                <FontAwesome icon="times-circle" style={styles.xIcon}/>
                {i18n.removeStudent()}
              </PopUpMenu.Item>
            }
          </QuickActionsCell>
        }
        {(isEditing && (rowType !== RowType.ADD)) &&
          <div>
            <Button
              onClick={this.onSave}
              color={Button.ButtonColor.orange}
              text={i18n.save()}
              disabled={this.props.isSaving || this.props.disableSaving}
              style={styles.saveButton}
            />
            <Button
              onClick={this.onCancel}
              color={Button.ButtonColor.gray}
              text={i18n.cancel()}
            />
          </div>
        }
        {(rowType === RowType.ADD) &&
          <div>
            <Button
              onClick={this.onAdd}
              color={Button.ButtonColor.gray}
              text={i18n.add()}
              disabled={this.props.isSaving || this.props.disableSaving}
            />
          </div>
        }
        <BaseDialog
          useUpdatedStyles
          uncloseable
          isOpen={this.state.deleting}
          style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 20}}
        >
          <h2 style={styles.heading}>{i18n.removeStudentHeader()}</h2>
          <div>
            {i18n.removeStudentConfirm1() + ' '}
            <a target="_blank" href="https://support.code.org/hc/en-us/articles/115001475131-Adding-a-personal-login-to-a-teacher-created-account">
              {i18n.removeStudentConfirm2()}
            </a>
            {' ' + i18n.removeStudentConfirm3()}
          </div>
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
  addStudent(id) {
    dispatch(addStudents([id]));
  },
}))(ManageStudentActionsCell);
