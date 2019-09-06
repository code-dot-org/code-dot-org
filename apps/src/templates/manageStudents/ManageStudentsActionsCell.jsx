import PropTypes from 'prop-types';
import React, {Component} from 'react';
import QuickActionsCell from '../tables/QuickActionsCell';
import PopUpMenu, {MenuBreak} from '@cdo/apps/lib/ui/PopUpMenu';
import color from '../../util/color';
import FontAwesome from '../FontAwesome';
import Button from '../Button';
import {
  startEditingStudent,
  cancelEditingStudent,
  removeStudent,
  saveStudent,
  addStudents,
  RowType
} from './manageStudentsRedux';
import {connect} from 'react-redux';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import ConfirmRemoveStudentDialog from './ConfirmRemoveStudentDialog';
import i18n from '@cdo/locale';

const styles = {
  xIcon: {
    paddingRight: 5
  },
  saveButton: {
    marginRight: 5
  }
};

class ManageStudentActionsCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired, // the student's user id
    sectionId: PropTypes.number,
    isEditing: PropTypes.bool,
    isSaving: PropTypes.bool,
    disableSaving: PropTypes.bool,
    rowType: PropTypes.oneOf(Object.values(RowType)),
    loginType: PropTypes.string,
    studentName: PropTypes.string.isRequired,
    hasEverSignedIn: PropTypes.bool,
    dependsOnThisSectionForLogin: PropTypes.bool,
    canEdit: PropTypes.bool,

    // Provided by redux
    startEditingStudent: PropTypes.func,
    cancelEditingStudent: PropTypes.func,
    removeStudent: PropTypes.func,
    saveStudent: PropTypes.func,
    addStudent: PropTypes.func
  };

  state = {
    deleting: false,
    requestInProgress: false
  };

  onConfirmDelete = () => {
    const {removeStudent, id, sectionId} = this.props;
    this.setState({requestInProgress: true});
    $.ajax({
      url: `/dashboardapi/sections/${sectionId}/students/${id}/remove`,
      method: 'POST'
    })
      .done(() => {
        removeStudent(id);
      })
      .fail((jqXhr, status) => {
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
    const canDelete = [
      SectionLoginType.word,
      SectionLoginType.picture,
      SectionLoginType.email
    ].includes(loginType);

    return (
      <div>
        {!isEditing && (
          <QuickActionsCell>
            {this.props.canEdit && (
              <PopUpMenu.Item onClick={this.onEdit}>
                {i18n.edit()}
              </PopUpMenu.Item>
            )}
            {this.props.canEdit && canDelete && <MenuBreak />}
            {canDelete && (
              <PopUpMenu.Item onClick={this.onRequestDelete} color={color.red}>
                <FontAwesome icon="times-circle" style={styles.xIcon} />
                {i18n.removeStudent()}
              </PopUpMenu.Item>
            )}
          </QuickActionsCell>
        )}
        {isEditing && rowType !== RowType.ADD && (
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
        )}
        {rowType === RowType.ADD && (
          <div>
            <Button
              onClick={this.onAdd}
              color={Button.ButtonColor.gray}
              text={i18n.add()}
              disabled={this.props.isSaving || this.props.disableSaving}
            />
          </div>
        )}
        <ConfirmRemoveStudentDialog
          isOpen={this.state.deleting}
          disabled={this.state.requestInProgress}
          studentName={this.props.studentName}
          hasEverSignedIn={this.props.hasEverSignedIn}
          dependsOnThisSectionForLogin={this.props.dependsOnThisSectionForLogin}
          onConfirm={this.onConfirmDelete}
          onCancel={this.onCancelDelete}
        />
      </div>
    );
  }
}

export const UnconnectedManageStudentActionsCell = ManageStudentActionsCell;

export default connect(
  state => ({}),
  dispatch => ({
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
    }
  })
)(ManageStudentActionsCell);
