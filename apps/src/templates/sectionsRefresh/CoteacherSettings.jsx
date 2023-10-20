import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';
import Button from '../Button';
import {Figcaption} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';

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

  const handleButtonClick = () => {
    const newEmail = inputValue;
    if (newEmail === '' || !newEmail.includes('@')) {
      setAddError(newEmail + ' is not a valid email address.');
      return;
    }

    addCoteacher(newEmail);
    setInputValue('');
  };

  const getErrorOrCount = useMemo(() => {
    if (addError) {
      return (
        <Figcaption className={styles.error}>
          <FontAwesome icon="info-circle" />
          {addError}
        </Figcaption>
      );
    } else {
      const count = sectionInstructors.length + coteachersToAdd.length;
      return (
        <Figcaption className={styles.count}>
          {count}/5 co-teachers added
        </Figcaption>
      );
    }
  }, [addError, coteachersToAdd, sectionInstructors]);

  return (
    <div className={styles.expandedSection}>
      {i18n.coteacherAddInfo()}
      <div className={styles.settings}>
        <div className={styles.add}>
          <label className={styles.label}>Email address</label>
          <div className={styles.container}>
            <input
              className={styles.input}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
            />
            <Button
              className={styles.button}
              color={Button.ButtonColor.brandSecondaryDefault}
              type="button"
              text="Add co-teacher"
              onClick={handleButtonClick}
              disabled={inputValue === ''}
            />
          </div>
          {getErrorOrCount}
        </div>
        <div className={styles.table}>{coteachersToAdd}</div>
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  addCoteacher: PropTypes.func,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
