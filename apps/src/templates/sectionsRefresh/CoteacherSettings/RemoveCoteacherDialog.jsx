import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '../../AccessibleDialog';
import styles from './coteacher-settings.module.scss';

export default function RemoveCoteacherDialog({
  coteacherToRemove,
  setCoteacherToRemove,
  removeSavedCoteacher,
  setCoteachersToAdd,
}) {
  const removeCoteacher = coteacher => e => {
    e.preventDefault();
    if (!coteacher.id) {
      // remove from coteachersToAdd
      setCoteachersToAdd(existing =>
        existing.filter(teacher => teacher !== coteacher.instructorEmail)
      );
      setCoteacherToRemove(null);
      return;
    }
    $.ajax({
      url: `/api/v1/section_instructors/${coteacher.id}`,
      method: 'DELETE',
    })
      .done(() => {
        removeSavedCoteacher(coteacher.id);
        setCoteacherToRemove(null);
      })
      .fail(() => setCoteacherToRemove(null));
  };

  return (
    !!coteacherToRemove && (
      <AccessibleDialog
        onClose={() => setCoteacherToRemove(null)}
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
            onClick={() => setCoteacherToRemove(null)}
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
};
