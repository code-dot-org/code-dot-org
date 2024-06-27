import PropTypes from 'prop-types';
import React, {useCallback} from 'react';

import {StrongText} from '@cdo/component-library';
import Button from '../../Button';
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
          removeSavedCoteacher(coteacher.id);
        }
        closeRemoveDialog();
      });
    },
    [closeRemoveDialog, setCoteachersToAdd, removeSavedCoteacher, sectionId]
  );

  return (
    !!coteacherToRemove && (
      <>
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
      </>
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
