import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import $ from 'jquery';

import styles from './coteacher-settings.module.scss';
import Button from '../Button';
import {Figcaption, StrongText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';
import classNames from 'classnames';
import _ from 'lodash';
import {isEmail} from '@cdo/apps/util/formatValidation';
import AccessibleDialog from '../AccessibleDialog';

export default function CoteacherSettings({
  sectionInstructors,
  //TODO before merge: change name to whatever Molly says
  primaryInstructor,
  setCoteachersToAdd,
  coteachersToAdd,
}) {
  const [inputValue, setInputValue] = useState('');
  const [addError, setAddError] = useState('');
  const [removedCoteacherIds, setRemovedCoteacherIds] = useState([]);
  const [coteacherToRemove, setCoteacherToRemove] = useState({});

  const statusSortValue = coteacher => {
    if (!coteacher.status) {
      return 0;
    } else if (coteacher.status === 'invited') {
      return 1;
    } else if (coteacher.status === 'declined') {
      return 2;
    } else if (coteacher.status === 'active') {
      return 3;
    }
    return 4;
  };

  const coteachers = React.useMemo(() => {
    const additions = coteachersToAdd.map(email => ({instructorEmail: email}));

    const unfiltered = !!sectionInstructors
      ? [...sectionInstructors, ...additions]
      : additions;

    // Remove the primary instructor and any coteachers that have been removed
    return unfiltered
      .filter(
        instructor =>
          !primaryInstructor ||
          instructor.instructorEmail !== primaryInstructor.email
      )
      .filter(instructor => !removedCoteacherIds.includes(instructor.id))
      .sort((a, b) => statusSortValue(a) - statusSortValue(b));
  }, [
    sectionInstructors,
    coteachersToAdd,
    removedCoteacherIds,
    primaryInstructor,
  ]);

  const addRemovedCoteacher = id => {
    setRemovedCoteacherIds([...removedCoteacherIds, id]);
  };

  const handleAddEmail = e => {
    e.preventDefault();
    const newEmail = inputValue;
    if (newEmail === '') {
      setAddError(i18n.coteacherAddNoEmail());
      return;
    }
    if (!isEmail(newEmail)) {
      setAddError(i18n.coteacherAddInvalidEmail({email: newEmail}));
      return;
    }
    if (
      coteachers.some(instructor => instructor.instructorEmail === newEmail)
    ) {
      setAddError(i18n.coteacherAddAlreadyExists({email: newEmail}));
      return;
    }

    setCoteachersToAdd(existing => [newEmail, ...existing]);
    setAddError('');
    setInputValue('');
  };

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const handleSubmitAddEmail = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail(e);
    }
  };

  const pill = (text, className, icon) => {
    return (
      <div className={classNames(className, styles.tablePill)}>
        <StrongText>
          <FontAwesome icon={icon} className={styles.tablePillIcon} />
          {text}
        </StrongText>
      </div>
    );
  };

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
      const additions = coteachersToAdd.filter(
        teacher => teacher !== coteacher.instructorEmail
      );
      setCoteachersToAdd(additions);
      setCoteacherToRemove({});
      return;
    }
    $.ajax({
      url: `/api/v1/section_instructors/${coteacher.id}`,
      method: 'DELETE',
    })
      .done(() => {
        addRemovedCoteacher(coteacher.id);
        setCoteacherToRemove({});
      })
      .fail(() => setCoteacherToRemove({}));
  };

  const removePopup = coteacher => {
    if (_.isEmpty(coteacher)) {
      return null;
    }
    return (
      <AccessibleDialog
        onClose={() => setCoteacherToRemove({})}
        className={styles.removeDialog}
      >
        <StrongText className={styles.removeDialogTitle}>
          {i18n.coteacherRemoveDialogHeader({email: coteacher.instructorEmail})}
        </StrongText>
        <div className={styles.removeDialogDescription}>
          {i18n.coteacherRemoveDialogDescription()}
        </div>
        <div className={styles.removeDialogButtons}>
          <Button
            onClick={() => setCoteacherToRemove({})}
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

  const getErrorOrCount = () => {
    if (addError) {
      return (
        <Figcaption
          className={classNames(styles.error, styles.inputDescription)}
        >
          <FontAwesome icon="info-circle" className={styles.infoCircle} />
          {addError}
        </Figcaption>
      );
    } else {
      return (
        <Figcaption className={styles.inputDescription}>
          {i18n.coteacherCount({count: coteachers.length})}
        </Figcaption>
      );
    }
  };

  const addForm = () => (
    <div className={styles.add}>
      <label className={styles.label}>{i18n.coteacherEmailAddress()}</label>
      <div className={styles.form} onSubmit={handleAddEmail}>
        <input
          className={classNames(styles.input, !!addError && styles.inputError)}
          type="text"
          disabled={coteachers.length >= 5}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleSubmitAddEmail}
        />
        <Button
          className={styles.button}
          color={Button.ButtonColor.brandSecondaryDefault}
          id="add-coteacher"
          type="submit"
          text={i18n.coteacherAddButton()}
          onClick={handleAddEmail}
          disabled={coteachers.length >= 5}
        />
      </div>
      {getErrorOrCount()}
    </div>
  );

  return (
    <div className={styles.expandedSection}>
      {i18n.coteacherAddInfo()}
      <div className={styles.settings}>
        {addForm()}
        {table()}
        {removePopup(coteacherToRemove)}
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  primaryInstructor: PropTypes.object,
  setCoteachersToAdd: PropTypes.func.isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
