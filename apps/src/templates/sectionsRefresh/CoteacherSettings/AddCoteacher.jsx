import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';

import {isEmail} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';
import classNames from 'classnames';
import {Figcaption} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';

import styles from '../coteacher-settings.module.scss';

export const AddCoteacher = ({
  coteachers,
  setCoteachersToAdd,
  addError,
  setAddError,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddEmail = useCallback(
    e => {
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
    },
    [coteachers, setCoteachersToAdd, setAddError, inputValue, setInputValue]
  );

  const handleInputChange = useCallback(
    event => {
      setInputValue(event.target.value);
    },
    [setInputValue]
  );

  const handleSubmitAddEmail = useCallback(
    e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddEmail(e);
      }
    },
    [handleAddEmail]
  );

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

  return (
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
};

AddCoteacher.propTypes = {
  coteachers: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCoteachersToAdd: PropTypes.func.isRequired,
  addError: PropTypes.string,
  setAddError: PropTypes.func.isRequired,
};
