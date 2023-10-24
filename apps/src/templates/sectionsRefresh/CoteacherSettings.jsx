import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';
import Button from '../Button';
import {Figcaption} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';
import classNames from 'classnames';
import {isEmail} from '@cdo/apps/util/formatValidation';

export default function CoteacherSettings({
  sectionInstructors,
  addCoteacher,
  coteachersToAdd,
}) {
  const [inputValue, setInputValue] = useState('');
  const [addError, setAddError] = useState('');

  const handleInputChange = event => {
    setInputValue(event.target.value);
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
  // If sectionInstructors is empty, we still want to count the primary teacher.
  const sectionInstructorsCount = sectionInstructors
    ? sectionInstructors.length
    : 1;
  const numCoteachers = sectionInstructorsCount + coteachersToAdd.length - 1;

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
        <div className={styles.table}>
          {coteachersToAdd}
          {sectionInstructors
            ? sectionInstructors.map(
                instructor => '   ' + instructor.instructorEmail
              )
            : null}
        </div>
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  addCoteacher: PropTypes.func.isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
