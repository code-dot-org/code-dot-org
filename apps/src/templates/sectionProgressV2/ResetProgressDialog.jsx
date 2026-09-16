import Checkbox from '@code-dot-org/component-library/checkbox';
import Modal from '@code-dot-org/component-library/modal';
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
import i18n from '@cdo/locale';

import {loadUnitProgress} from './sectionProgressLoader';

import styles from './reset-progress-dialog.module.scss';

const STEP = {
  SELECT: 'select',
  CONFIRM: 'confirm',
};

export default function ResetProgressDialog({
  students,
  unitId,
  sectionId,
  courseId,
  unitPosition,
  onClose,
}) {
  const [step, setStep] = React.useState(STEP.SELECT);
  const [selectedIds, setSelectedIds] = React.useState(() => new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const allSelected =
    students.length > 0 && selectedIds.size === students.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

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

      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_RESET_PROGRESS, {
        sectionId,
        unitId,
        studentCount: selectedIds.size,
      });

      loadUnitProgress(unitId, sectionId, courseId, unitPosition);
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      setHasError(true);
    }
  };

  if (step === STEP.SELECT) {
    return (
      <Modal
        title={i18n.resetProgress()}
        description={i18n.resetProgressSelectStudentsDescription()}
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
      description={i18n.resetProgressConfirmWarning()}
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
        disabled: isSubmitting,
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
  sectionId: PropTypes.number.isRequired,
  courseId: PropTypes.number,
  unitPosition: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};
