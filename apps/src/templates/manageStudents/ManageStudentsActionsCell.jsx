import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {navigateToHref} from '@cdo/apps/utils';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import ConfirmRemoveStudentDialog from './ConfirmRemoveStudentDialog';
import {
  startEditingStudent,
  cancelEditingStudent,
  removeStudent,
  saveStudent,
  addStudents,
  RowType,
} from './manageStudentsRedux';

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
    rowData: PropTypes.object,

    // Provided by redux
    startEditingStudent: PropTypes.func,
    cancelEditingStudent: PropTypes.func,
    removeStudent: PropTypes.func,
    saveStudent: PropTypes.func,
    addStudent: PropTypes.func,
    loadSectionData: PropTypes.func,
    syncEnabled: PropTypes.bool,
  };

  state = {
    deleting: false,
    requestInProgress: false,
  };

  reportEvent = (eventName, payload = {}) => {
    analyticsReporter.sendEvent(eventName, {
      sectionId: this.props.sectionId,
      sectionLoginType: this.props.loginType,
      selectedUsState: this.props.rowData?.editingData?.usState,
      ...payload,
    });
  };

  onConfirmDelete = () => {
    const {removeStudent, id, sectionId, loadSectionData} = this.props;
    this.setState({requestInProgress: true});
    $.ajax({
      url: `/dashboardapi/sections/${sectionId}/students/${id}/remove`,
      method: 'POST',
    })
      .done(() => {
        removeStudent(id);
        loadSectionData(sectionId);
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
    const {id} = this.props;
    this.props.startEditingStudent(id);
  };

  onCancel = () => {
    const {id} = this.props;
    if (this.props.rowType === RowType.NEW_STUDENT) {
      this.props.removeStudent(this.props.id);
    } else {
      this.props.cancelEditingStudent(id);
    }
  };

  onSave = () => {
    const {id} = this.props;
    if (this.props.rowType === RowType.NEW_STUDENT) {
      this.onAdd();
    } else {
      this.props.saveStudent(id);
      this.reportEvent(EVENTS.SECTION_STUDENTS_TABLE_SAVE_ROW_CLICKED, {
        studentId: this.props.id || null,
        originalUsState: this.props.rowData?.usState,
      });
    }
  };

  onAdd = () => {
    const {id} = this.props;
    this.props.addStudent(id);
    this.reportEvent(EVENTS.SECTION_STUDENTS_TABLE_ADD_ROW_CLICKED);
  };

  onPrintLoginInfo = () => {
    const {id, sectionId} = this.props;

    const url =
      teacherDashboardUrl(sectionId, '/login_info') + `?studentId=${id}`;
    navigateToHref(url);
  };

  onViewParentLetter = () => {
    const {id, sectionId} = this.props;
    const url =
      teacherDashboardUrl(sectionId, '/parent_letter') + `?studentId=${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  buildActionOptions() {
    const {canEdit, loginType, id} = this.props;
    const showWordPictureOptions = [
      SectionLoginType.word,
      SectionLoginType.picture,
    ].includes(loginType);

    const options = [];
    if (canEdit) {
      options.push({
        value: `edit-${id}`,
        label: i18n.edit(),
        icon: {iconName: 'pen'},
        onClick: this.onEdit,
      });
    }
    if (showWordPictureOptions) {
      options.push({
        value: `print-${id}`,
        label: i18n.printLoginCard(),
        icon: {iconName: 'print'},
        onClick: this.onPrintLoginInfo,
      });
      options.push({
        value: `parent-letter-${id}`,
        label: i18n.viewParentLetter(),
        icon: {iconName: 'file-lines'},
        onClick: this.onViewParentLetter,
      });
    }
    options.push({
      value: `remove-${id}`,
      label: i18n.removeStudent(),
      icon: {iconName: 'circle-xmark'},
      isOptionDestructive: true,
      onClick: this.onRequestDelete,
    });
    return options;
  }

  render() {
    const {id, rowType, isEditing, loginType} = this.props;

    return (
      <div>
        {!isEditing &&
          (loginType !== SectionLoginType.lti_v1 ||
            !this.props.syncEnabled) && (
            <ActionDropdown
              name={`student-row-actions-${id}`}
              labelText={i18n.actions()}
              size="s"
              menuPlacement="right"
              options={this.buildActionOptions()}
              triggerButtonProps={{
                color: 'tertiary',
                variant: 'text',
                children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
              }}
            />
          )}
        {isEditing && rowType !== RowType.ADD && (
          <div>
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              onClick={this.onSave}
              disabled={this.props.isSaving || this.props.disableSaving}
              type="button"
            >
              {i18n.save()}
            </MuiButton>{' '}
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={this.onCancel}
              type="button"
            >
              {i18n.cancel()}
            </MuiButton>
          </div>
        )}
        {rowType === RowType.ADD && (
          <div>
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={this.onAdd}
              disabled={this.props.isSaving || this.props.disableSaving}
              type="button"
            >
              {i18n.add()}
            </MuiButton>
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
    loadSectionData(sectionId) {
      dispatch(asyncLoadSectionData(sectionId));
    },
  })
)(ManageStudentsActionsCell);
