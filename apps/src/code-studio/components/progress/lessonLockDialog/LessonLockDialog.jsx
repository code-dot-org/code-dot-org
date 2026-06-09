import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton} from '@mui/material';
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
import {NO_SECTION} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import {refetchSectionLockStatus} from '../../../lessonLockRedux';
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
      clientLockState.map(item =>
        item.isDemoStudent ? item : {...item, lockStatus}
      )
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

  // Step-action button (Allow editing / Lock lesson / Show answers /
  // Re-lock lesson). Use MUI Button in the primary-CTA visual so each
  // step's action stands out from the surrounding instructions.
  const stepButton = (onClick, label) => (
    <MuiButton
      type="button"
      variant="contained"
      color="primary"
      size="small"
      sx={styles.stepButton}
      onClick={onClick}
    >
      {label}
    </MuiButton>
  );

  const renderHiddenWarning = () => (
    <div style={styles.hiddenError}>{i18n.hiddenAssessmentWarning()}</div>
  );

  const renderInstructionsAndButtons = () => (
    <>
      <table style={hiddenUnlessSelectedSection}>
        <tbody>
          <tr>
            <td>1. {i18n.allowEditingInstructions()}</td>
            <td>{stepButton(allowEditing, i18n.allowEditing())}</td>
          </tr>
          <tr>
            <td>2. {i18n.lockStageInstructions()}</td>
            <td>{stepButton(lockLesson, i18n.lockStage())}</td>
          </tr>
          <tr>
            <td>3. {i18n.showAnswersInstructions()}</td>
            <td>{stepButton(showAnswers, i18n.showAnswers())}</td>
          </tr>
          <tr>
            <td>4. {i18n.relockStageInstructions()}</td>
            <td>{stepButton(lockLesson, i18n.relockStage())}</td>
          </tr>
          <tr>
            <td>5. {i18n.reviewResponses()}</td>
            <td>
              <MuiButton
                type="button"
                variant="outlined"
                color="secondary"
                size="small"
                sx={styles.stepButton}
                onClick={viewSection}
              >
                {i18n.viewSection()}
              </MuiButton>
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
            clientLockState.map(({name, lockStatus, isDemoStudent}, index) => (
              <StudentRow
                key={index}
                index={index}
                name={name}
                lockStatus={lockStatus}
                isDemoStudent={isDemoStudent}
                handleRadioChange={handleRadioChange}
              />
            ))
          )}
        </tbody>
      </table>
    </>
  );

  return (
    <Modal
      onClose={handleClose}
      title={i18n.assessmentSteps()}
      customContent={
        <div id="dsco-dialog-description" style={styles.main}>
          <div style={styles.sectionSelectorRow}>
            <SectionSelector requireSelection={hasSelectedSection} />
          </div>
          {lessonIsHidden && renderHiddenWarning()}
          {renderInstructionsAndButtons()}
          {renderStudentTable()}
          {error && <span style={styles.saveError}>{error}</span>}
        </div>
      }
      primaryButtonProps={{
        onClick: handleSave,
        children: saving ? i18n.saving() : i18n.save(),
        disabled: saving || !hasSelectedSection,
      }}
      secondaryButtonProps={{
        onClick: handleClose,
        children: i18n.dialogCancel(),
      }}
    />
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
    color: 'var(--text-neutral-primary)',
    whiteSpace: 'normal',
    textAlign: 'left',
  },
  sectionSelectorRow: {
    marginBottom: 15,
  },
  title: {
    color: 'var(--text-brand-teal-primary)',
    fontSize: 20,
    fontWeight: 900,
    marginTop: 15,
    marginBottom: 15,
  },
  headerRow: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--borders-brand-teal-primary)',
    backgroundColor: 'var(--background-brand-teal-primary)',
    color: 'var(--text-neutral-inverse)',
    padding: 10,
    fontSize: '100%',
    fontWeight: 400,
  },
  descriptionText: {
    marginTop: 10,
    marginBottom: 10,
  },
  studentTable: {
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
  saveError: {
    color: 'var(--text-error-primary)',
    fontStyle: 'italic',
    display: 'block',
    marginTop: 10,
  },
  hiddenError: {
    color: 'var(--text-error-primary)',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  stepButton: {
    width: '100%',
  },
};

export const UnconnectedLessonLockDialog = LessonLockDialog;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId,
  }),
  {refetchSectionLockStatus}
)(LessonLockDialog);
