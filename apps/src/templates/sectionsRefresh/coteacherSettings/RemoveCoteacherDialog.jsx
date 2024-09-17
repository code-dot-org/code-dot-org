import PropTypes from 'prop-types';
import React, {useCallback} from 'react';

import {StrongText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import AccessibleDialog from '../../../sharedComponents/AccessibleDialog';

import styles from './coteacher-settings.module.scss';

export default function RemoveCoteacherDialog({
  coteacherToRemove,
  setCoteacherToRemove,
  removeSavedCoteacher,
  setCoteachersToAdd,
  sectionId,
}) {
  const closeRemoveDialog = useCallback(() => {
    setCoteacherToRemove(null);
  }, [setCoteacherToRemove]);

  const removeCoteacher = useCallback(
    coteacher => e => {
      e.preventDefault();
      if (!coteacher.id) {
        // remove from coteachersToAdd
        setCoteachersToAdd(existing =>
          existing.filter(teacher => teacher !== coteacher.instructorEmail)
        );
        closeRemoveDialog();
        return;
      }
      fetch(`/api/v1/section_instructors/${coteacher.id}`, {
        headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
        method: 'DELETE',
      }).then(response => {
        if (response.ok) {
          analyticsReporter.sendEvent(EVENTS.COTEACHER_REMOVED, {
            sectionId: sectionId,
          });
          removeSavedCoteacher(coteacher.id);
        }
        closeRemoveDialog();
      });
    },
    [closeRemoveDialog, setCoteachersToAdd, removeSavedCoteacher, sectionId]
  );

  return (
    !!coteacherToRemove && (
      <AccessibleDialog
        onClose={closeRemoveDialog}
        className={styles.removeDialog}
      >
        <StrongText className={styles.removeDialogTitle}>
          {i18n.coteacherRemoveDialogHeader({
            email: coteacherToRemove.instructorEmail,
          })}
        </StrongText>
        <div className={styles.removeDialogDescription}>
          {i18n.coteacherRemoveDialogDescription()}
        </div>
        <div className={styles.removeDialogButtons}>
          <Button
            onClick={closeRemoveDialog}
            text={i18n.dialogCancel()}
            color={Button.ButtonColor.white}
            id="remove-coteacher-cancel"
          />
          <Button
            onClick={removeCoteacher(coteacherToRemove)}
            text={i18n.dialogRemove()}
            color={Button.ButtonColor.red}
            className={styles.removeDialogRemove}
          />
        </div>
      </AccessibleDialog>
    )
  );
}

RemoveCoteacherDialog.propTypes = {
  coteacherToRemove: PropTypes.object,
  setCoteacherToRemove: PropTypes.func.isRequired,
  removeSavedCoteacher: PropTypes.func.isRequired,
  setCoteachersToAdd: PropTypes.func.isRequired,
  sectionId: PropTypes.number,
};
