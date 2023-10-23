import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';
import Button from '../Button';
import {Figcaption} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';
import classNames from 'classnames';

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
    console.log(sectionInstructors);
    if (newEmail === '') {
      setAddError(i18n.coteacherAddNoEmail());
      return;
    }
    if (!newEmail.includes('@')) {
      setAddError(i18n.coteacherAddInvalidEmail({email: newEmail}));
      return;
    }
    if (
      sectionInstructors.some(
        instructor => instructor.instructorEmail === newEmail
      ) ||
      coteachersToAdd.some(email => email === newEmail)
    ) {
      setAddError(i18n.coteacherAddAlreadyExists({email: newEmail}));
      return;
    }

    addCoteacher(newEmail);
    setAddError('');
    setInputValue('');
  };

  // coteacher count is teachers to add + the existing teachers - the primary teacher.
  const numCoteachers = useMemo(
    () => sectionInstructors.length + coteachersToAdd.length - 1,
    [sectionInstructors, coteachersToAdd]
  );

  const getErrorOrCount = useMemo(() => {
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
  }, [addError, numCoteachers]);

  const isAddDisabled = useMemo(() => {
    return numCoteachers >= 5;
  }, [numCoteachers]);

  return (
    <div className={styles.expandedSection}>
      {i18n.coteacherAddInfo()}
      <div className={styles.settings}>
        <div className={styles.add}>
          <label className={styles.label}>{i18n.coteacherEmailAddress()}</label>
          <form className={styles.form} onSubmit={handleAddEmail}>
            <input
              className={classNames(
                styles.input,
                !!addError && styles.inputError
              )}
              type="text"
              disabled={isAddDisabled}
              value={inputValue}
              onChange={handleInputChange}
            />
            <Button
              className={styles.button}
              color={Button.ButtonColor.brandSecondaryDefault}
              type="submit"
              text={i18n.coteacherAddButton()}
              onClick={handleAddEmail}
              disabled={isAddDisabled}
            />
          </form>
          {getErrorOrCount}
        </div>
        <div className={styles.table}>
          {coteachersToAdd}
          {sectionInstructors.map(
            instructor => '   ' + instructor.instructorEmail
          )}
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
