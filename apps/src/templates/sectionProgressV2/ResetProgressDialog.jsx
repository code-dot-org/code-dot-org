import Checkbox from '@code-dot-org/component-library/checkbox';
import Modal from '@code-dot-org/component-library/modal';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getFullName} from '@cdo/apps/templates/manageStudents/utils';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from '@cdo/apps/util/AuthenticityTokenStore';
import experiments from '@cdo/apps/util/experiments';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {loadUnitProgress} from './sectionProgressLoader';

import styles from './reset-progress-dialog.module.scss';

const STEP = {
  SELECT: 'select',
  CONFIRM: 'confirm',
};

const REASON_STORAGE_KEY = 'reset-progress-reason';

// Long enough for a sentence or two; the value rides along on an analytics
// event, so it is not open-ended.
const REASON_MAX_LENGTH = 500;

export default function ResetProgressDialog({
  students,
  unitId,
  unitName,
  sectionId,
  courseId,
  unitPosition,
  onClose,
}) {
  const [step, setStep] = React.useState(STEP.SELECT);
  const askForReason = React.useMemo(
    () => experiments.isEnabled(experiments.RESET_PROGRESS_REASON),
    []
  );
  // Seeded from the last reset so a teacher resetting for the same reason
  // does not retype it. tryGetLocalStorage returns null for a key that was
  // never set - its default only covers a thrown exception.
  const [reason, setReason] = React.useState(
    () => (askForReason && tryGetLocalStorage(REASON_STORAGE_KEY, '')) || ''
  );

  // The unit name comes from course data that may not have loaded; fall back
  // to wording that does not name the unit rather than naming an empty one.
  const selectStudentsDescription = unitName
    ? i18n.resetProgressSelectStudentsDescriptionForUnit({unitName})
    : i18n.resetProgressSelectStudentsDescription();
  const confirmWarning = unitName
    ? i18n.resetProgressConfirmWarningForUnit({unitName})
    : i18n.resetProgressConfirmWarning();
  const [selectedIds, setSelectedIds] = React.useState(() => new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const allSelected =
    students.length > 0 && selectedIds.size === students.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const trimmedReason = reason.trim();
  const reasonMissing = askForReason && trimmedReason.length === 0;

  const toggleStudent = studentId => {
    setSelectedIds(previous => {
      const next = new Set(previous);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(students.map(s => s.id)));
  };

  const resetProgress = async () => {
    setIsSubmitting(true);
    setHasError(false);

    // Reported on every attempt, including a retry after a failure, so the
    // submitted/succeeded pair reads as a funnel rather than a count of resets.
    const eventData = {
      sectionId,
      unitId,
      studentCount: selectedIds.size,
      sectionStudentCount: students.length,
      allStudentsSelected: allSelected,
    };
    if (askForReason) {
      trySetLocalStorage(REASON_STORAGE_KEY, trimmedReason);
    }
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_RESET_PROGRESS_SUBMITTED, {
      ...eventData,
      ...(askForReason && {resetReason: trimmedReason}),
    });

    try {
      const response = await fetch('/dashboardapi/mass_progress_reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [AUTHENTICITY_TOKEN_HEADER]: await getAuthenticityToken(),
        },
        body: JSON.stringify({
          unit_ids: [unitId],
          student_ids: [...selectedIds],
        }),
      });

      if (!response.ok) {
        throw new Error(`mass_progress_reset failed: ${response.status}`);
      }

      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_RESET_PROGRESS, eventData);

      loadUnitProgress(unitId, sectionId, courseId, unitPosition);
      onClose();
    } catch (error) {
      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_RESET_PROGRESS_FAILED, {
        ...eventData,
        error: error.message,
      });
      setIsSubmitting(false);
      setHasError(true);
    }
  };

  if (step === STEP.SELECT) {
    return (
      <Modal
        title={i18n.resetProgress()}
        description={selectStudentsDescription}
        customContent={
          <div className={styles.studentListContainer}>
            <div className={styles.selectAllRow}>
              <Checkbox
                name="reset-progress-select-all"
                label={i18n.selectAll()}
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleSelectAll}
              />
            </div>
            <div className={styles.studentGrid}>
              {students.map(student => (
                <Checkbox
                  key={student.id}
                  className={styles.studentCheckboxItem}
                  name={`reset-progress-student-${student.id}`}
                  label={getFullName(student)}
                  checked={selectedIds.has(student.id)}
                  onChange={() => toggleStudent(student.id)}
                />
              ))}
            </div>
          </div>
        }
        onClose={onClose}
        primaryButtonProps={{
          id: 'ui-reset-progress-select-next',
          children: i18n.next(),
          'aria-label': i18n.next(),
          disabled: selectedIds.size === 0,
          onClick: () => setStep(STEP.CONFIRM),
        }}
        secondaryButtonProps={{
          id: 'ui-reset-progress-select-cancel',
          children: i18n.dialogCancel(),
          'aria-label': i18n.dialogCancel(),
          onClick: onClose,
        }}
      />
    );
  }

  return (
    <Modal
      title={i18n.resetProgressConfirmTitle()}
      description={confirmWarning}
      customContent={
        askForReason && (
          <div className={styles.reasonField}>
            <TextField
              name="reset-progress-reason"
              label={i18n.resetProgressReasonLabel()}
              value={reason}
              onChange={event => setReason(event.target.value)}
              helperMessage={i18n.resetProgressReasonRequired()}
              maxLength={REASON_MAX_LENGTH}
              required
            />
          </div>
        )
      }
      customBottomContent={
        hasError && (
          <Typography className={styles.error} variant="body2">
            {i18n.formServerError()}
          </Typography>
        )
      }
      onClose={onClose}
      primaryButtonProps={{
        id: 'ui-reset-progress-confirm',
        children: i18n.resetProgress(),
        'aria-label': i18n.resetProgress(),
        color: 'error',
        disabled: isSubmitting || reasonMissing,
        onClick: resetProgress,
      }}
      secondaryButtonProps={{
        id: 'ui-reset-progress-confirm-cancel',
        children: i18n.dialogCancel(),
        'aria-label': i18n.dialogCancel(),
        onClick: onClose,
      }}
    />
  );
}

ResetProgressDialog.propTypes = {
  students: PropTypes.arrayOf(studentShape).isRequired,
  unitId: PropTypes.number.isRequired,
  unitName: PropTypes.string,
  sectionId: PropTypes.number.isRequired,
  courseId: PropTypes.number,
  unitPosition: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};
