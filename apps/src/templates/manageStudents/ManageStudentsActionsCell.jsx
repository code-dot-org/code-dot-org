import PropTypes from 'prop-types';
import React, {Component} from 'react';
import $ from 'jquery';
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
import {getCurrentSection} from '@cdo/apps/util/userSectionClient';
import {setSection} from '@cdo/apps/redux/sectionDataRedux';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import firehoseClient from '@cdo/apps/lib/util/firehose';

class ManageStudentsActionsCell extends Component {
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
    addStudent: PropTypes.func,
    setSection: PropTypes.func
  };

  state = {
    deleting: false,
    requestInProgress: false
  };

  onConfirmDelete = () => {
    const {removeStudent, id, sectionId, setSection} = this.props;
    this.setState({requestInProgress: true});
    $.ajax({
      url: `/dashboardapi/sections/${sectionId}/students/${id}/remove`,
      method: 'POST'
    })
      .done(() => {
        removeStudent(id);
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'manage-students-actions',
            event: 'single-student-delete',
            data_json: JSON.stringify({
              sectionId: sectionId,
              studentId: id
            })
          },
          {includeUserId: true}
        );
        getCurrentSection(sectionId, section => setSection(section));
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
    const {id, sectionId} = this.props;
    this.props.startEditingStudent(id);
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'single-student-start-edit',
        data_json: JSON.stringify({
          sectionId: sectionId,
          studentId: id
        })
      },
      {includeUserId: true}
    );
  };

  onCancel = () => {
    const {id, sectionId} = this.props;
    if (this.props.rowType === RowType.NEW_STUDENT) {
      this.props.removeStudent(this.props.id);
    } else {
      firehoseClient.putRecord(
        {
          study: 'teacher-dashboard',
          study_group: 'manage-students-actions',
          event: 'single-student-cancel-edit',
          data_json: JSON.stringify({
            sectionId: sectionId,
            studentId: id
          })
        },
        {includeUserId: true}
      );
      this.props.cancelEditingStudent(id);
    }
  };

  onSave = () => {
    const {id, sectionId} = this.props;
    if (this.props.rowType === RowType.NEW_STUDENT) {
      this.onAdd();
    } else {
      this.props.saveStudent(id);
      firehoseClient.putRecord(
        {
          study: 'teacher-dashboard',
          study_group: 'manage-students-actions',
          event: 'single-student-save',
          data_json: JSON.stringify({
            sectionId: sectionId,
            studentId: id
          })
        },
        {includeUserId: true}
      );
    }
  };

  onAdd = () => {
    const {id, sectionId} = this.props;
    this.props.addStudent(id);
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'single-student-add',
        data_json: JSON.stringify({
          sectionId: sectionId,
          studentId: id
        })
      },
      {includeUserId: true}
    );
  };

  onPrintLoginInfo = () => {
    const {id, sectionId} = this.props;

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'single-student-print-login-card',
        data_json: JSON.stringify({
          sectionId: sectionId,
          studentId: id
        })
      },
      {includeUserId: true}
    );

    const url =
      teacherDashboardUrl(sectionId, '/login_info') + `?studentId=${id}`;
    navigateToHref(url);
  };

  onViewParentLetter = () => {
    const {id, sectionId} = this.props;
    const url =
      teacherDashboardUrl(sectionId, '/parent_letter') + `?studentId=${id}`;
    window.open(url, '_blank');
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'single-student-download-parent-letter',
        data_json: JSON.stringify({
          sectionId: sectionId,
          studentId: id
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    const {rowType, isEditing, loginType} = this.props;
    const canDelete = [
      SectionLoginType.word,
      SectionLoginType.picture,
      SectionLoginType.email
    ].includes(loginType);

    const showWordPictureOptions = [
      SectionLoginType.word,
      SectionLoginType.picture
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
            {showWordPictureOptions && (
              <PopUpMenu.Item onClick={this.onPrintLoginInfo}>
                {i18n.printLoginCard()}
              </PopUpMenu.Item>
            )}
            {showWordPictureOptions && (
              <PopUpMenu.Item onClick={this.onViewParentLetter}>
                {i18n.viewParentLetter()}
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
              __useDeprecatedTag
              onClick={this.onSave}
              color={Button.ButtonColor.orange}
              text={i18n.save()}
              disabled={this.props.isSaving || this.props.disableSaving}
              style={styles.saveButton}
            />
            <Button
              __useDeprecatedTag
              onClick={this.onCancel}
              color={Button.ButtonColor.gray}
              text={i18n.cancel()}
            />
          </div>
        )}
        {rowType === RowType.ADD && (
          <div>
            <Button
              __useDeprecatedTag
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

const styles = {
  xIcon: {
    paddingRight: 5
  },
  saveButton: {
    marginRight: 5
  }
};

export const UnconnectedManageStudentsActionsCell = ManageStudentsActionsCell;

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
    },
    setSection(section) {
      dispatch(setSection(section));
    }
  })
)(ManageStudentsActionsCell);
