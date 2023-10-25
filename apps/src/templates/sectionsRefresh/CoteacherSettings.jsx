import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';

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
  primaryInstructor,
  addCoteacher,
  coteachersToAdd,
}) {
  const [inputValue, setInputValue] = useState('');
  const [addError, setAddError] = useState('');
  const [removedCoteacherIds, setRemovedCoteacherIds] = useState([]);
  const [coteacherToRemove, setCoteacherToRemove] = useState({});

  const coteachers = React.useMemo(() => {
    const unfiltered = sectionInstructors
      ? [
          ...sectionInstructors,
          ...coteachersToAdd.map(email => ({instructorEmail: email})),
        ]
      : coteachersToAdd;

    // Remove the primary instructor and any coteachers that have been removed
    return unfiltered.filter(
      instructor =>
        instructor.instructorEmail !== primaryInstructor.email &&
        !removedCoteacherIds.includes(instructor.id)
    );
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

    addCoteacher(newEmail);
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

  const getTableRow = (index, coteacher) => {
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
        <td>{coteacher.status}</td>
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
    if (coteacher.id === null) {
      // remove from coteachersToAdd
      coteachersToAdd.splice(
        coteachersToAdd.indexOf(coteacher.instructorEmail),
        1
      );
      return;
    }
    $.ajax({
      url: `/api/v1/section_instructors/${coteacher.id}`,
      method: 'DELETE',
    }).then(response => {
      if (!response || response.status !== 'failure') {
        addRemovedCoteacher(coteacher.id);
      }
      setCoteacherToRemove({});
    });
  };

  const removePopup = coteacher => {
    return (
      <AccessibleDialog onClose={() => setCoteacherToRemove({})}>
        <StrongText>
          Remove {coteacher.instructorEmail} as a co-teacher?
        </StrongText>
        <br />
        <div>
          This teacher will lose their ability to manage or view student work
          for this section.
        </div>
        <Button onClick={() => setCoteacherToRemove({})} text="Cancel" />
        <Button onClick={removeCoteacher(coteacher)} text="Remove" />
      </AccessibleDialog>
    );
  };

  const table = () => {
    if (coteachers.length === 0) {
      return <div>You haven't added any co-teachers yet</div>;
    }
    return (
      <table className={styles.table}>
        <tbody>
          {coteachers.map((instructor, id) => getTableRow(id, instructor))}
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
        {!_.isEmpty(coteacherToRemove) && removePopup(coteacherToRemove)}
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  primaryInstructor: PropTypes.object,
  addCoteacher: PropTypes.func.isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
