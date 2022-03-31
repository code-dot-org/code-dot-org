import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import progressStyles from './progressStyles';
import {LockStatus, saveLockDialog} from '../../lessonLockRedux';
import color from '../../../util/color';
import commonMsg from '@cdo/locale';
import SectionSelector from './SectionSelector';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {NO_SECTION} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

function LessonLockDialog({
  isOpen,
  handleClose,
  initialLockStatus,
  selectedSectionId,
  saving,
  saveDialog
}) {
  const [lockStatuses, setLockStatuses] = useState(initialLockStatus);

  useEffect(() => {
    if (!saving) {
      setLockStatuses(initialLockStatus);
    }
  }, [initialLockStatus]);

  //
  // Event handlers
  //
  const setAllLockStatus = lockStatus => {
    setLockStatuses(currentLockStatuses =>
      currentLockStatuses.map(item => ({...item, lockStatus}))
    );
  };

  const allowEditing = () => setAllLockStatus(LockStatus.Editable);

  const lockLesson = () => setAllLockStatus(LockStatus.Locked);

  const showAnswers = () => setAllLockStatus(LockStatus.ReadonlyAnswers);

  const viewSection = () => {
    const assessmentsUrl = teacherDashboardUrl(
      selectedSectionId,
      '/assessments'
    );
    window.open(assessmentsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRadioChange = event => {
    const modifiedIndex = parseInt(event.target.name, 10);
    const value = event.target.value;

    setLockStatuses(currentLockStatuses =>
      currentLockStatuses.map((item, index) => {
        if (index !== modifiedIndex) {
          return item;
        }
        return {...item, lockStatus: value};
      })
    );
  };

  const handleSave = () => {
    saveDialog(selectedSectionId, lockStatuses);
  };

  //
  // Rendering helpers that each render a section of the dialog
  //
  const hasSelectedSection = selectedSectionId !== NO_SECTION;
  const hiddenUnlessSelectedSection = hasSelectedSection ? {} : styles.hidden;

  const renderHeading = () => (
    <div>
      <span style={styles.title}>{commonMsg.assessmentSteps()}</span>
      <SectionSelector
        style={{marginLeft: 10}}
        requireSelection={hasSelectedSection}
      />
    </div>
  );

  const renderInstructionsAndButtons = () => (
    <>
      <table style={hiddenUnlessSelectedSection}>
        <tbody>
          <tr>
            <td>1. {commonMsg.allowEditingInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={allowEditing}
              >
                {commonMsg.allowEditing()}
              </button>
            </td>
          </tr>
          <tr>
            <td>2. {commonMsg.lockStageInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={lockLesson}
              >
                {commonMsg.lockStage()}
              </button>
            </td>
          </tr>
          <tr>
            <td>3. {commonMsg.showAnswersInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={showAnswers}
              >
                {commonMsg.showAnswers()}
              </button>
            </td>
          </tr>
          <tr>
            <td>4. {commonMsg.relockStageInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={lockLesson}
              >
                {commonMsg.relockStage()}
              </button>
            </td>
          </tr>
          <tr>
            <td>5. {commonMsg.reviewResponses()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.whiteButton}
                onClick={viewSection}
              >
                {commonMsg.viewSection()}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{...styles.descriptionText, ...hiddenUnlessSelectedSection}}>
        {commonMsg.autolock()}
      </div>
    </>
  );

  const renderStudentTable = () => (
    <>
      <div style={{...styles.title, ...hiddenUnlessSelectedSection}}>
        {commonMsg.studentControl()}
      </div>
      <div style={{...styles.descriptionText, ...hiddenUnlessSelectedSection}}>
        {commonMsg.studentLockStateInstructions()}
      </div>
      <table
        id="ui-test-student-table"
        style={{...styles.studentTable, ...hiddenUnlessSelectedSection}}
      >
        <thead>
          <tr>
            <th style={styles.headerRow}>{commonMsg.student()}</th>
            <th style={styles.headerRow}>{commonMsg.locked()}</th>
            <th style={styles.headerRow}>{commonMsg.editable()}</th>
            <th style={styles.headerRow}>{commonMsg.answersVisible()}</th>
          </tr>
        </thead>
        <tbody>
          {lockStatuses.map(({name, lockStatus}, index) =>
            renderStudentRow(index, name, lockStatus)
          )}
        </tbody>
      </table>
    </>
  );

  const renderStudentRow = (index, name, lockStatus) => (
    <tr key={index}>
      <td style={styles.tableCell}>{name}</td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.Locked && styles.selectedCell)
        }}
      >
        <input
          type="radio"
          name={index}
          value={LockStatus.Locked}
          checked={lockStatus === LockStatus.Locked}
          onChange={handleRadioChange}
        />
      </td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.Editable && styles.selectedCell)
        }}
      >
        <input
          type="radio"
          name={index}
          value={LockStatus.Editable}
          checked={lockStatus === LockStatus.Editable}
          onChange={handleRadioChange}
        />
      </td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.ReadonlyAnswers && styles.selectedCell)
        }}
      >
        <input
          type="radio"
          name={index}
          value={LockStatus.ReadonlyAnswers}
          checked={lockStatus === LockStatus.ReadonlyAnswers}
          onChange={handleRadioChange}
        />
      </td>
    </tr>
  );

  const renderFooterButtons = () => (
    <div style={styles.buttonContainer}>
      <button
        type="button"
        style={progressStyles.baseButton}
        onClick={handleClose}
      >
        {commonMsg.dialogCancel()}
      </button>
      <button
        type="button"
        style={{
          ...progressStyles.blueButton,
          ...hiddenUnlessSelectedSection
        }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? commonMsg.saving() : commonMsg.save()}
      </button>
    </div>
  );

  //
  // Main rendering logic
  //
  const responsiveHeight = {
    maxHeight: window.innerHeight * 0.8 - 100
  };

  return (
    <BaseDialog isOpen={isOpen} handleClose={handleClose}>
      <div style={{...styles.main, ...responsiveHeight}}>
        {renderHeading()}
        {renderInstructionsAndButtons()}
        {renderStudentTable()}
      </div>
      {renderFooterButtons()}
    </BaseDialog>
  );
}

LessonLockDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  initialLockStatus: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      lockStatus: PropTypes.oneOf(Object.values(LockStatus)).isRequired
    })
  ),
  selectedSectionId: PropTypes.number,
  saving: PropTypes.bool.isRequired,
  saveDialog: PropTypes.func.isRequired
};

const styles = {
  main: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: color.charcoal,
    whiteSpace: 'normal',
    // maxHeight provided in render method based on window size
    overflowY: 'scroll',
    textAlign: 'left'
  },
  title: {
    color: color.teal,
    fontSize: 20,
    fontWeight: 900,
    marginTop: 15,
    marginBottom: 15
  },
  headerRow: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    backgroundColor: color.teal,
    padding: 10,
    fontSize: '100%',
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold'
  },
  descriptionText: {
    marginTop: 10,
    marginBottom: 10
  },
  studentTable: {
    width: '100%'
  },
  tableCell: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    padding: 10
  },
  selectedCell: {
    backgroundColor: color.lightest_teal
  },
  radioCell: {
    textAlign: 'center'
  },
  buttonContainer: {
    textAlign: 'right',
    marginRight: 15
  },
  hidden: {
    display: 'none'
  }
};

export const UnconnectedLessonLockDialog = LessonLockDialog;

export default connect(
  state => ({
    initialLockStatus: state.lessonLock.lockStatus,
    isOpen: !!state.lessonLock.lockDialogLessonId,
    saving: state.lessonLock.saving,
    selectedSectionId: state.teacherSections.selectedSectionId
  }),
  dispatch => ({
    saveDialog(sectionId, lockStatus) {
      dispatch(saveLockDialog(sectionId, lockStatus));
    }
  })
)(LessonLockDialog);
