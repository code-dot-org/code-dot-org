import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {compact} from 'lodash';
import {getVisibleSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';
import {
  updateStudentTransfer,
  transferStudents,
  TransferType,
  TransferStatus,
  cancelStudentTransfer
} from './manageStudentsRedux';
import color from '@cdo/apps/util/color';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const OTHER_TEACHER = 'otherTeacher';
const PADDING = 20;
const DIALOG_WIDTH = 800;
const INPUT_WIDTH = 225;

class MoveStudents extends Component {
  static propTypes = {
    studentData: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired,
    transferData: PropTypes.shape({
      studentIds: PropTypes.array.isRequired,
      sectionId: PropTypes.number,
      otherTeacher: PropTypes.bool.isRequired,
      otherTeacherSection: PropTypes.string.isRequired,
      copyStudents: PropTypes.bool.isRequired
    }),
    transferStatus: PropTypes.shape({
      status: PropTypes.string,
      type: PropTypes.string,
      error: PropTypes.string
    }),

    // redux provided
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        loginType: PropTypes.string.isRequired
      })
    ).isRequired,
    currentSectionId: PropTypes.number.isRequired,
    updateStudentTransfer: PropTypes.func.isRequired,
    transferStudents: PropTypes.func.isRequired,
    cancelStudentTransfer: PropTypes.func.isRequired
  };

  state = {
    isDialogOpen: false
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'move-students-button-click',
        data_json: JSON.stringify({
          sectionId: this.props.currentSectionId
        })
      },
      {includeUserId: true}
    );
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
    const isExternallyRostered = ![
      SectionLoginType.word,
      SectionLoginType.picture,
      SectionLoginType.email
    ].includes(section.loginType);

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
        sectionId: null
      };
    } else {
      newTransferData = {
        otherTeacher: false,
        sectionId: parseInt(sectionValue),
        copyStudents: false
      };
    }

    this.props.updateStudentTransfer({...newTransferData});
  };

  onChangeTeacherSection = event => {
    this.props.updateStudentTransfer({
      otherTeacherSection: event.target.value
    });
  };

  onChangeMoveOrCopy = event => {
    this.props.updateStudentTransfer({
      copyStudents: event.target.value === TransferType.COPY_STUDENTS
    });
  };

  transfer = () => {
    this.props.transferStudents(this.closeDialog);
  };

  isButtonDisabled = () => {
    const {
      studentIds,
      sectionId,
      otherTeacher,
      otherTeacherSection
    } = this.props.transferData;
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

  render() {
    const {studentData, transferData, transferStatus} = this.props;
    // Define a sorting transform that can be applied to each column

    const pendingTransfer = transferStatus.status === TransferStatus.PENDING;

    const selectedStudentData = studentData.map(row => ({
      ...row,
      isChecked: transferData.studentIds.includes(row.id)
    }));

    return (
      <div>
        <Button
          __useDeprecatedTag
          onClick={this.openDialog}
          color={Button.ButtonColor.gray}
          text={i18n.moveStudents()}
          icon="sign-out"
        />
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          handleClose={this.closeDialog}
        >
          <SortedTableSelect
            rowData={selectedStudentData}
            onRowChecked={id => this.toggleStudentSelected(id)}
            options={this.getOptions()}
            onChooseOption={this.onChangeSection}
            descriptionText={i18n.selectStudentsToMove()}
            optionsDescriptionText={`${i18n.moveToSection()}:`}
            titleText={i18n.moveStudents()}
            onSelectAll={shouldSelectAll => this.toggleAll(shouldSelectAll)}
          >
            <div>
              {transferStatus.status === TransferStatus.FAIL && (
                <div id="uitest-error" style={styles.error}>
                  {transferStatus.error}
                </div>
              )}
              {transferData.otherTeacher && (
                <div id="uitest-other-teacher">
                  <label htmlFor="sectionCode" style={styles.label}>
                    {`${i18n.enterSectionCode()}:`}
                  </label>
                  <input
                    required
                    name="sectionCode"
                    style={styles.sectionInput}
                    value={transferData.otherTeacherSection}
                    onChange={this.onChangeTeacherSection}
                    placeholder={i18n.sectionCodePlaceholder()}
                  />
                  <label style={styles.label}>
                    {i18n.bothSectionsQuestion()}
                  </label>
                  <label style={styles.input}>
                    <input
                      type="radio"
                      value={TransferType.COPY_STUDENTS}
                      checked={transferData.copyStudents}
                      onChange={this.onChangeMoveOrCopy}
                    />
                    <span style={styles.radioOption}>
                      {i18n.copyStudentsConfirm()}
                    </span>
                  </label>
                  <label style={styles.input}>
                    <input
                      type="radio"
                      value="move"
                      checked={!transferData.copyStudents}
                      onChange={this.onChangeMoveOrCopy}
                    />
                    <span style={styles.radioOption}>
                      {i18n.moveStudentsConfirm()}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </SortedTableSelect>
          <DialogFooter>
            <Button
              __useDeprecatedTag
              text={i18n.dialogCancel()}
              onClick={this.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              __useDeprecatedTag
              text={i18n.moveStudents()}
              onClick={this.transfer}
              color={Button.ButtonColor.orange}
              disabled={pendingTransfer || this.isButtonDisabled()}
              isPending={pendingTransfer}
              pendingText={i18n.movingStudents()}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  dialog: {
    padding: PADDING,
    width: DIALOG_WIDTH,
    marginLeft: -(DIALOG_WIDTH / 2)
  },
  label: {
    paddingTop: PADDING / 2
  },
  input: {
    marginLeft: PADDING / 2
  },
  sectionInput: {
    width: INPUT_WIDTH
  },
  radioOption: {
    paddingLeft: PADDING / 2,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  error: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red,
    paddingBottom: PADDING / 2
  }
};

export const UnconnectedMoveStudents = MoveStudents;

export default connect(
  state => ({
    sections: getVisibleSections(state),
    currentSectionId: state.sectionData.section.id
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
    }
  })
)(MoveStudents);
