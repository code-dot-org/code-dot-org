import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {flushSync} from 'react-dom';
import {connect} from 'react-redux';

import {
  LockStatus,
  useGetLockState,
  saveLockState,
} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import SkeletonRows from '@cdo/apps/code-studio/components/progress/lessonLockDialog/SkeletonRows';
import StudentRow from '@cdo/apps/code-studio/components/progress/lessonLockDialog/StudentRow';
import fontConstants from '@cdo/apps/fontConstants';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {NO_SECTION} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {refetchSectionLockStatus} from '../../../lessonLockRedux';
import progressStyles from '../progressStyles';
import SectionSelector from '../SectionSelector';

function LessonLockDialog({
  unitId,
  lessonId,
  handleClose,
  selectedSectionId,
  refetchSectionLockStatus,
  lessonIsHidden,
}) {
  const {loading, serverLockState} = useGetLockState(
    unitId,
    lessonId,
    selectedSectionId
  );

  const [clientLockState, setClientLockState] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // The data returned from useGetLockState is the state that's currently saved
  // on the server associated with the given unit, lesson, and section. We also
  // need to separately track the client state which will reflect the changes
  // made by the user in this dialog. This line re-syncs the client state to the
  // server state whenever the server state changes (e.g. when the selected
  // section changes). Any unsaved changes are lost.
  useEffect(() => setClientLockState(serverLockState), [serverLockState]);

  //
  // Event handlers
  //
  const setAllLockStatus = lockStatus => {
    setClientLockState(clientLockState =>
      clientLockState.map(item => ({...item, lockStatus}))
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

  const handleRadioChange = (modifiedIndex, lockStatus) => {
    setClientLockState(clientLockState =>
      clientLockState.map((item, index) => {
        if (index !== modifiedIndex) {
          return item;
        }
        return {...item, lockStatus: lockStatus};
      })
    );
  };

  /*
  Checks that the user is trying to save new information, otherwise closes
  the dialog without sending to api post method.
  */
  const handleSave = async () => {
    if (_.isEqual(serverLockState, clientLockState)) {
      handleClose();
    } else {
      sendSave();
    }
  };

  const sendSave = async () => {
    setSaving(true);
    setError(null);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const saveLockStateResponse = await saveLockState(
      serverLockState,
      clientLockState,
      csrfToken
    );
    if (saveLockStateResponse.ok) {
      // Refresh the lock information on the script overview page and teacher panel
      await refetchSectionLockStatus(selectedSectionId, unitId);
      handleClose();
    } else {
      saveLockStateResponse.json().then(json => {
        // opt out of automatic batching due to conflict with useEffect
        // see: https://github.com/reactwg/react-18/discussions/21
        flushSync(() => {
          setSaving(false);
        });
        if (json.error) {
          flushSync(() => {
            setError(
              i18n.errorSavingLockStatusWithMessage({
                errorMessage: json.error,
              })
            );
          });
        } else {
          flushSync(() => {
            setError(i18n.errorSavingLockStatus());
          });
        }
      });
    }
  };

  //
  // Rendering helpers that each render a section of the dialog
  //
  const hasSelectedSection = selectedSectionId !== NO_SECTION;
  const hiddenUnlessSelectedSection = hasSelectedSection ? {} : styles.hidden;

  const renderHiddenWarning = () => (
    <div style={styles.hiddenError}>{i18n.hiddenAssessmentWarning()}</div>
  );

  const renderInstructionsAndButtons = () => (
    <>
      <table style={hiddenUnlessSelectedSection}>
        <tbody>
          <tr>
            <td>1. {i18n.allowEditingInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={allowEditing}
              >
                {i18n.allowEditing()}
              </button>
            </td>
          </tr>
          <tr>
            <td>2. {i18n.lockStageInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={lockLesson}
              >
                {i18n.lockStage()}
              </button>
            </td>
          </tr>
          <tr>
            <td>3. {i18n.showAnswersInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={showAnswers}
              >
                {i18n.showAnswers()}
              </button>
            </td>
          </tr>
          <tr>
            <td>4. {i18n.relockStageInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={lockLesson}
              >
                {i18n.relockStage()}
              </button>
            </td>
          </tr>
          <tr>
            <td>5. {i18n.reviewResponses()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.whiteButton}
                onClick={viewSection}
              >
                {i18n.viewSection()}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{...styles.descriptionText, ...hiddenUnlessSelectedSection}}>
        {i18n.autolock()}
      </div>
    </>
  );

  const renderStudentTable = () => (
    <>
      <div style={{...styles.title, ...hiddenUnlessSelectedSection}}>
        {i18n.studentControl()}
      </div>
      <div style={{...styles.descriptionText, ...hiddenUnlessSelectedSection}}>
        {i18n.studentLockStateInstructions()}
      </div>
      <table
        id="ui-test-student-table"
        style={{...styles.studentTable, ...hiddenUnlessSelectedSection}}
      >
        <thead>
          <tr>
            <th style={styles.headerRow}>{i18n.student()}</th>
            <th style={styles.headerRow}>{i18n.locked()}</th>
            <th style={styles.headerRow}>{i18n.editable()}</th>
            <th style={styles.headerRow}>{i18n.answersVisible()}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows numRows={5} numCols={4} />
          ) : (
            clientLockState.map(({name, lockStatus}, index) => (
              <StudentRow
                key={index}
                index={index}
                name={name}
                lockStatus={lockStatus}
                handleRadioChange={handleRadioChange}
              />
            ))
          )}
        </tbody>
      </table>
    </>
  );

  //
  // Main rendering logic
  //
  const responsiveHeight = {
    maxHeight: window.innerHeight * 0.8 - 100,
  };

  return (
    <BaseDialog isOpen handleClose={handleClose}>
      <div style={{...styles.main, ...responsiveHeight}}>
        <div>
          <span style={styles.title}>{i18n.assessmentSteps()}</span>
          <SectionSelector
            style={{marginLeft: 10}}
            requireSelection={hasSelectedSection}
          />
        </div>
        {lessonIsHidden && renderHiddenWarning()}
        {renderInstructionsAndButtons()}
        {renderStudentTable()}
      </div>
      <div style={styles.buttonContainer}>
        {error && <span style={styles.saveError}>{error}</span>}
        <button
          type="button"
          style={progressStyles.baseButton}
          onClick={handleClose}
        >
          {i18n.dialogCancel()}
        </button>
        <button
          type="button"
          style={{
            ...progressStyles.blueButton,
            ...hiddenUnlessSelectedSection,
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? i18n.saving() : i18n.save()}
        </button>
      </div>
    </BaseDialog>
  );
}

LessonLockDialog.propTypes = {
  unitId: PropTypes.number.isRequired,
  lessonId: PropTypes.number.isRequired,
  handleClose: PropTypes.func.isRequired,
  lessonIsHidden: PropTypes.bool,

  // Provided by redux
  selectedSectionId: PropTypes.number,
  refetchSectionLockStatus: PropTypes.func.isRequired,
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
    textAlign: 'left',
  },
  title: {
    color: color.teal,
    fontSize: 20,
    fontWeight: 900,
    marginTop: 15,
    marginBottom: 15,
  },
  headerRow: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    backgroundColor: color.teal,
    padding: 10,
    fontSize: '100%',
    ...fontConstants['main-font-regular'],
  },
  descriptionText: {
    marginTop: 10,
    marginBottom: 10,
  },
  studentTable: {
    width: '100%',
  },
  buttonContainer: {
    textAlign: 'right',
    marginRight: 15,
  },
  hidden: {
    display: 'none',
  },
  saveError: {
    color: color.red,
    fontStyle: 'italic',
    marginRight: 10,
  },
  hiddenError: {
    color: color.red,
    fontStyle: 'italic',
    marginBottom: 10,
  },
};

export const UnconnectedLessonLockDialog = LessonLockDialog;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId,
  }),
  dispatch => ({
    refetchSectionLockStatus(sectionId, lockStatus) {
      dispatch(refetchSectionLockStatus(sectionId, lockStatus));
    },
  })
)(LessonLockDialog);
