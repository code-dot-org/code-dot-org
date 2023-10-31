import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';

import {isEmail} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';
import classNames from 'classnames';
import {Figcaption} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';

import styles from './coteacher-settings.module.scss';

export default function AddCoteacher({
  sectionId,
  coteachers,
  coteachersToAdd,
  setCoteachersToAdd,
  addError,
  setAddError,
}) {
  const [inputValue, setInputValue] = useState('');

  const getInputErrorMessage = useCallback(
    email => {
      if (email === '') {
        return Promise.resolve(i18n.coteacherAddNoEmail());
      }
      if (!isEmail(email)) {
        return Promise.resolve(i18n.coteacherAddInvalidEmail({email}));
      }
      if (coteachersToAdd.some(coteacher => coteacher === email)) {
        return Promise.resolve(i18n.coteacherAddAlreadyAdded({email}));
      }

      const params = {email: email, ...(sectionId && {section_id: sectionId})};

      return new Promise(resolve => {
        return $.ajax({
          url: `/api/v1/section_instructors/check`,
          method: 'GET',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          data: params,
        })
          .done(() => {
            resolve('');
          })
          .fail((jqXHR, textStatus, errorThrown) => {
            console.log('lfm', jqXHR, textStatus, errorThrown);

            if (errorThrown === 'Not Found') {
              resolve(i18n.coteacherAddNoAccount({email}));
            }
            if (jqXHR.responseText.includes('already invited')) {
              resolve(i18n.coteacherAddAlreadyExists({email}));
            }
            if (jqXHR.responseText.includes('section full')) {
              resolve(i18n.coteacherAddSectionFull());
            }
            if (jqXHR.responseText.includes('inviting self')) {
              resolve(i18n.coteacherCannotInviteSelf());
            }
            if (errorThrown === 'Forbidden') {
              resolve(i18n.coteacherUnableToEditCoteachers());
            }
            resolve(i18n.coteacherUnknownValidationError({email}));
          });
      });
    },
    [coteachersToAdd, sectionId]
  );

  const handleAddEmail = useCallback(
    e => {
      e.preventDefault();
      const newEmail = inputValue;
      getInputErrorMessage(newEmail).then(errorMessage => {
        setAddError(errorMessage);

        if (errorMessage === '') {
          setCoteachersToAdd(existing => [newEmail, ...existing]);
          setInputValue('');
        }
      });
    },
    [
      setCoteachersToAdd,
      setAddError,
      inputValue,
      setInputValue,
      getInputErrorMessage,
    ]
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
}

AddCoteacher.propTypes = {
  sectionId: PropTypes.number,
  coteachers: PropTypes.arrayOf(PropTypes.object).isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCoteachersToAdd: PropTypes.func.isRequired,
  addError: PropTypes.string,
  setAddError: PropTypes.func.isRequired,
};
