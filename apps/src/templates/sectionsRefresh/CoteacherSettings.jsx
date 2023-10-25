import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';
import Button from '../Button';
import {Figcaption, StrongText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';
import classNames from 'classnames';
import {isEmail} from '@cdo/apps/util/formatValidation';

export default function CoteacherSettings({
  sectionInstructors,
  primaryInstructor,
  addCoteacher,
  coteachersToAdd,
}) {
  const [inputValue, setInputValue] = useState('');
  const [addError, setAddError] = useState('');

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  React.useEffect(() => console.log(primaryInstructor), [primaryInstructor]);

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
      (sectionInstructors &&
        sectionInstructors.some(
          instructor => instructor.instructorEmail === newEmail
        )) ||
      coteachersToAdd.some(email => email === newEmail)
    ) {
      setAddError(i18n.coteacherAddAlreadyExists({email: newEmail}));
      return;
    }

    addCoteacher(newEmail);
    setAddError('');
    setInputValue('');
  };

  const handleSubmitAddEmail = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail(e);
    }
  };

  // coteacher count is teachers to add + the existing teachers - the primary teacher.
  // If sectionInstructors is populated, we assume one of them is the primary teacher.
  const existingCoteachers = sectionInstructors
    ? sectionInstructors.length - 1
    : 0;
  const numCoteachers = existingCoteachers + coteachersToAdd.length;

  const isAddDisabled = numCoteachers >= 5;

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
          {i18n.coteacherCount({count: numCoteachers})}
        </Figcaption>
      );
    }
  };

  const handleRemove = email => {
    // TODO: implement
  };

  const getTableRow = (email, index, name = null, status = null) => {
    return (
      <tr key={index}>
        <td>
          <div>
            {name ? <StrongText> {name}</StrongText> : null}
            <br />
            {email}
          </div>
        </td>
        <td>{status}</td>
        <td>
          <Button onClick={handleRemove}>
            <FontAwesome icon="trash" />
          </Button>
        </td>
      </tr>
    );
  };

  const getTable = (sectionInstructors, coteachersToAdd) => {
    const filteredInstructors = sectionInstructors
      ? sectionInstructors.filter(
          instructor => instructor.instructorEmail !== primaryInstructor.email
        )
      : [];
    if (filteredInstructors.length === 0 && coteachersToAdd.length === 0) {
      return <div>You haven't added any co-teachers yet</div>;
    }
    return (
      <table className={styles.table}>
        <tbody>
          {coteachersToAdd.map((email, id) => getTableRow(email, id))}
          {filteredInstructors.map((instructor, id) =>
            getTableRow(
              instructor.instructorEmail,
              id,
              instructor.instructorName,
              instructor.status
            )
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.expandedSection}>
      {i18n.coteacherAddInfo()}
      <div className={styles.settings}>
        <div className={styles.add}>
          <label className={styles.label}>{i18n.coteacherEmailAddress()}</label>
          <div className={styles.form} onSubmit={handleAddEmail}>
            <input
              className={classNames(
                styles.input,
                !!addError && styles.inputError
              )}
              type="text"
              disabled={isAddDisabled}
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
              disabled={isAddDisabled}
            />
          </div>
          {getErrorOrCount()}
        </div>
        {getTable(sectionInstructors, coteachersToAdd)}
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
