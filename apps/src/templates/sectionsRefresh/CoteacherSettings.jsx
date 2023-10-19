import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';
import Button from '../Button';

export default function CoteacherSettings({addCoteacher, coteachersToAdd}) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = () => {
    const newEmail = inputValue;
    if (newEmail === '') {
      return;
    }

    addCoteacher(newEmail);
    setInputValue('');
  };

  return (
    <div className={styles.expandedSection}>
      {i18n.coteacherAddInfo()}
      <div className={styles.settings}>
        <div className={styles.add}>
          <label className={styles.addLabel}>Email address</label>
          <input
            className={styles.addInput}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
          <Button
            className={styles.addButton}
            color={Button.ButtonColor.brandSecondaryDefault}
            type="button"
            text="Add co-teacher"
            onClick={handleButtonClick}
            disabled={inputValue === ''}
          />
        </div>
        <div className={styles.table}>{coteachersToAdd}</div>
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  addCoteacher: PropTypes.func,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
