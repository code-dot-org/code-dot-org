import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton} from '@mui/material';
import {compact} from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';
import {getVisibleSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

import {NON_LMS_LOGIN_TYPES} from '../teacherDashboard/LoginTypeConstants';

import {
  updateStudentTransfer,
  transferStudents,
  TransferType,
  TransferStatus,
  cancelStudentTransfer,
} from './manageStudentsRedux';

import moduleStyles from './moveStudents.module.scss';

const OTHER_TEACHER = 'otherTeacher';

class MoveStudents extends Component {
  static propTypes = {
    studentData: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    transferData: PropTypes.shape({
      studentIds: PropTypes.array.isRequired,
      sectionId: PropTypes.number,
      otherTeacher: PropTypes.bool.isRequired,
      otherTeacherSection: PropTypes.string.isRequired,
      copyStudents: PropTypes.bool.isRequired,
    }),
    transferStatus: PropTypes.shape({
      status: PropTypes.string,
      type: PropTypes.string,
      error: PropTypes.string,
    }),

    // redux provided
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        loginType: PropTypes.string.isRequired,
      })
    ).isRequired,
    currentSectionId: PropTypes.number.isRequired,
    updateStudentTransfer: PropTypes.func.isRequired,
    transferStudents: PropTypes.func.isRequired,
    cancelStudentTransfer: PropTypes.func.isRequired,
  };

  state = {
    isDialogOpen: false,
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
    this.props.cancelStudentTransfer();
  };

  getStudentIds = () => {
    return this.props.studentData.map(s => s.id);
  };

  toggleStudentSelected = studentId => {
    let studentIds = [...this.props.transferData.studentIds];

    if (studentIds.includes(studentId)) {
      const studentIndex = studentIds.indexOf(studentId);
      studentIds.splice(studentIndex, 1);
    } else {
      studentIds.push(studentId);
    }

    this.props.updateStudentTransfer({studentIds});
  };

  isValidDestinationSection = section => {
    const isSameAsSource = section.id === this.props.currentSectionId;
    const isExternallyRostered = !NON_LMS_LOGIN_TYPES.includes(
      section.loginType
    );

    return !isSameAsSource && !isExternallyRostered;
  };

  getOptions = () => {
    const {sections} = this.props;
    let options = Object.keys(sections).map(sectionId => {
      const section = sections[sectionId];
      if (this.isValidDestinationSection(section)) {
        return {id: section.id, name: section.name};
      } else {
        return null;
      }
    });
    options = compact(options);

    // Add final 'other teacher' options
    options.push({id: OTHER_TEACHER, name: i18n.otherTeacher()});
    return options;
  };

  onChangeSection = event => {
    const sectionValue = event.target.value;
    let newTransferData;

    if (sectionValue === OTHER_TEACHER) {
      newTransferData = {
        otherTeacher: true,
        sectionId: null,
      };
    } else {
      newTransferData = {
        otherTeacher: false,
        sectionId: parseInt(sectionValue),
        copyStudents: false,
      };
    }

    this.props.updateStudentTransfer({...newTransferData});
  };

  onChangeTeacherSection = event => {
    this.props.updateStudentTransfer({
      otherTeacherSection: event.target.value,
    });
  };

  onChangeMoveOrCopy = event => {
    this.props.updateStudentTransfer({
      copyStudents: event.target.value === TransferType.COPY_STUDENTS,
    });
  };

  transfer = () => {
    this.props.transferStudents(this.closeDialog);
  };

  isButtonDisabled = () => {
    const {studentIds, sectionId, otherTeacher, otherTeacherSection} =
      this.props.transferData;
    if (otherTeacher) {
      return studentIds.length === 0 || !otherTeacherSection;
    } else {
      return studentIds.length === 0 || !sectionId;
    }
  };

  toggleAll = shouldSelectAll => {
    let studentIds = [];

    if (shouldSelectAll) {
      studentIds = this.getStudentIds();
    }

    this.props.updateStudentTransfer({studentIds});
  };

  renderModalContent() {
    const {studentData, transferData, transferStatus} = this.props;

    const selectedStudentData = studentData.map(row => ({
      ...row,
      isChecked: transferData.studentIds.includes(row.id),
    }));

    return (
      <SortedTableSelect
        rowData={selectedStudentData}
        onRowChecked={id => this.toggleStudentSelected(id)}
        options={this.getOptions()}
        onChooseOption={this.onChangeSection}
        descriptionText={i18n.selectStudentsToMove()}
        optionsDescriptionText={`${i18n.moveToSection()}:`}
        onSelectAll={shouldSelectAll => this.toggleAll(shouldSelectAll)}
      >
        <div>
          {transferStatus.status === TransferStatus.FAIL && (
            <div id="uitest-error" className={moduleStyles.error}>
              {transferStatus.error}
            </div>
          )}
          {transferData.otherTeacher && (
            <div id="uitest-other-teacher">
              <label htmlFor="sectionCode" className={moduleStyles.label}>
                {`${i18n.enterSectionCode()}:`}
              </label>
              <input
                required
                name="sectionCode"
                className={moduleStyles.sectionInput}
                value={transferData.otherTeacherSection}
                onChange={this.onChangeTeacherSection}
                placeholder={i18n.sectionCodePlaceholder()}
              />
              <label className={moduleStyles.label}>
                {i18n.bothSectionsQuestion()}
              </label>
              <label className={moduleStyles.radioLabel}>
                <input
                  type="radio"
                  value={TransferType.COPY_STUDENTS}
                  checked={transferData.copyStudents}
                  onChange={this.onChangeMoveOrCopy}
                />
                <span className={moduleStyles.radioOption}>
                  {i18n.copyStudentsConfirm()}
                </span>
              </label>
              <label className={moduleStyles.radioLabel}>
                <input
                  type="radio"
                  value="move"
                  checked={!transferData.copyStudents}
                  onChange={this.onChangeMoveOrCopy}
                />
                <span className={moduleStyles.radioOption}>
                  {i18n.moveStudentsConfirm()}
                </span>
              </label>
            </div>
          )}
        </div>
      </SortedTableSelect>
    );
  }

  render() {
    const {transferStatus} = this.props;
    const pendingTransfer = transferStatus.status === TransferStatus.PENDING;

    return (
      <>
        <MuiButton
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={this.openDialog}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="right-from-bracket" />}
        >
          {i18n.moveStudents()}
        </MuiButton>
        {this.state.isDialogOpen && (
          <Modal
            title={i18n.moveStudents()}
            onClose={this.closeDialog}
            className={moduleStyles.modal}
            customContent={this.renderModalContent()}
            primaryButtonProps={{
              children: pendingTransfer
                ? i18n.movingStudents()
                : i18n.moveStudents(),
              onClick: this.transfer,
              disabled: pendingTransfer || this.isButtonDisabled(),
              loading: pendingTransfer,
              size: 'small',
            }}
            secondaryButtonProps={{
              children: i18n.dialogCancel(),
              onClick: this.closeDialog,
              size: 'small',
            }}
          />
        )}
      </>
    );
  }
}

export const UnconnectedMoveStudents = MoveStudents;

export default connect(
  state => ({
    sections: getVisibleSections(state),
    currentSectionId: state.teacherSections.selectedSectionId,
  }),
  dispatch => ({
    updateStudentTransfer(transferData) {
      dispatch(updateStudentTransfer(transferData));
    },
    transferStudents(onComplete) {
      dispatch(transferStudents(onComplete));
    },
    cancelStudentTransfer() {
      dispatch(cancelStudentTransfer());
    },
  })
)(MoveStudents);
