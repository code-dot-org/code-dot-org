import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

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
      <Dialog
        className={styles.removeDialog}
        title={i18n.coteacherRemoveDialogHeader({
          email: coteacherToRemove.instructorEmail,
        })}
        description={i18n.coteacherRemoveDialogDescription()}
        onClose={closeRemoveDialog}
        primaryButtonProps={{
          onClick: removeCoteacher(coteacherToRemove),
          color: 'error',
          children: i18n.dialogRemove(),
        }}
        secondaryButtonProps={{
          id: 'remove-coteacher-cancel',
          onClick: closeRemoveDialog,
          color: 'tertiary',
          children: i18n.dialogCancel(),
        }}
      />
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
