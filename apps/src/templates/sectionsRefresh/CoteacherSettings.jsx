import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import $ from 'jquery';

import styles from './coteacher-settings.module.scss';
import Button from '@cdo/apps/templates/Button';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import AccessibleDialog from '../AccessibleDialog';
import {AddCoteacher} from './CoteacherSettings/AddCoteacher';

export default function CoteacherSettings({
  sectionInstructors,
  primaryTeacher,
  setCoteachersToAdd,
  coteachersToAdd,
}) {
  const [addError, setAddError] = useState('');
  const [coteacherToRemove, setCoteacherToRemove] = useState(null);

  const initialCoteachers = (sectionInstructors, primaryTeacher) => {
    if (!sectionInstructors) {
      return [];
    }
    if (!primaryTeacher) {
      return sectionInstructors;
    }
    return sectionInstructors.filter(
      instructor => instructor.instructorEmail !== primaryTeacher.email
    );
  };

  const [savedCoteachers, setSavedCoteachers] = useState(
    initialCoteachers(sectionInstructors, primaryTeacher)
  );

  const statusSortValue = coteacher => {
    if (coteacher.status === 'invited') {
      return 0;
    } else if (coteacher.status === 'declined') {
      return 1;
    } else if (coteacher.status === 'active') {
      return 2;
    }
    return 3;
  };

  const coteachers = React.useMemo(() => {
    const unsaved = coteachersToAdd.map(email => ({instructorEmail: email}));

    const sortedSaved = savedCoteachers.sort(
      (a, b) => statusSortValue(a) - statusSortValue(b)
    );
    return [...unsaved, ...sortedSaved];
  }, [savedCoteachers, coteachersToAdd]);

  const removeSavedCoteacher = id => {
    setSavedCoteachers(prevSaved =>
      prevSaved.filter(coteacher => coteacher.id !== id)
    );
  };

  const pill = (text, className, icon) => (
    <div className={classNames(className, styles.tablePill)}>
      <StrongText>
        <FontAwesome icon={icon} className={styles.tablePillIcon} />
        {text}
      </StrongText>
    </div>
  );

  const statusPill = status => {
    if (!status || status === 'invited') {
      return pill(i18n.coteacherPending(), styles.tablePending, 'ellipsis');
    } else if (status === 'active') {
      return pill(i18n.coteacherAccepted(), styles.tableActive, 'check');
    } else if (status === 'declined') {
      return pill(i18n.coteacherDeclined(), styles.tableDeclined, 'xmark');
    } else {
      return pill(i18n.coteacherError(), styles.tableError, 'xmark');
    }
  };

  const tableRow = (index, coteacher) => {
    return (
      <tr key={index} className={styles.tableRow}>
        <td className={styles.tableInfoCell}>
          <div>
            {coteacher.instructorName ? (
              <>
                <StrongText> {coteacher.instructorName}</StrongText>
                <br />
              </>
            ) : null}

            {coteacher.instructorEmail}
          </div>
        </td>
        <td className={styles.tableStatusCell}>
          {statusPill(coteacher.status)}
        </td>
        <td>
          <button
            type="button"
            onClick={() => setCoteacherToRemove(coteacher)}
            className={styles.tableRemoveButton}
          >
            <i className={classNames('fa-solid fa-trash', styles.trashIcon)} />
          </button>
        </td>
      </tr>
    );
  };

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

  const removePopup = coteacher => {
    return (
      coteacher && (
        <AccessibleDialog
          onClose={() => setCoteacherToRemove(null)}
          className={styles.removeDialog}
        >
          <StrongText className={styles.removeDialogTitle}>
            {i18n.coteacherRemoveDialogHeader({
              email: coteacher.instructorEmail,
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
              onClick={removeCoteacher(coteacher)}
              text={i18n.dialogRemove()}
              color={Button.ButtonColor.red}
              className={styles.removeDialogRemove}
            />
          </div>
        </AccessibleDialog>
      )
    );
  };

  const table = () => {
    if (coteachers.length === 0) {
      return (
        <div className={classNames(styles.table, styles.tableRow)}>
          {i18n.coteacherNoCoteachers()}
        </div>
      );
    }
    return (
      <table className={styles.table}>
        <tbody>
          {coteachers.map((instructor, id) => tableRow(id, instructor))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.expandedSection}>
      {i18n.coteacherAddInfo()}
      <div className={styles.settings}>
        <AddCoteacher
          coteachers={coteachers}
          setCoteachersToAdd={setCoteachersToAdd}
          addError={addError}
          setAddError={setAddError}
        />

        {table()}
        {removePopup(coteacherToRemove)}
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  primaryTeacher: PropTypes.object,
  setCoteachersToAdd: PropTypes.func.isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
