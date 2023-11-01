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
  numCoteachers,
  coteachersToAdd,
  setCoteachersToAdd,
  addError,
  setAddError,
}) {
  const [inputValue, setInputValue] = useState('');

  const getInputErrorMessage = useCallback(
    email => {
      const trimmedEmail = email.trim();
      if (trimmedEmail === '') {
        return Promise.resolve(i18n.coteacherAddNoEmail());
      }
      if (!isEmail(trimmedEmail)) {
        return Promise.resolve(i18n.coteacherAddInvalidEmail({trimmedEmail}));
      }
      if (coteachersToAdd.some(coteacher => coteacher === trimmedEmail)) {
        console.log('lfm already exists', trimmedEmail);
        return Promise.resolve(i18n.coteacherAddAlreadyExists({trimmedEmail}));
      }

      const params = {
        email: trimmedEmail,
        ...(sectionId && {section_id: sectionId}),
      };

      console.log('lfm what');
      return new Promise(resolve => {
        console.log('lfm fuck');
        return $.ajax({
          url: `/api/v1/section_instructors/check`,
          method: 'GET',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          data: params,
          success: () => {
            console.log('lfm resolved');
            resolve('');
          },
          fail: (jqXHR, _textStatus, errorThrown) => {
            console.log('lfm failed', jqXHR.responseText, errorThrown);
            if (errorThrown === 'Not Found') {
              resolve(i18n.coteacherAddNoAccount({email: trimmedEmail}));
            }
            if (errorThrown === 'Forbidden') {
              resolve(i18n.coteacherUnableToEditCoteachers());
            }

            if (jqXHR.responseText.includes('already invited')) {
              resolve(i18n.coteacherAddAlreadyExists({email: trimmedEmail}));
            }
            if (jqXHR.responseText.includes('section full')) {
              resolve(i18n.coteacherAddSectionFull());
            }
            if (jqXHR.responseText.includes('inviting self')) {
              resolve(i18n.coteacherCannotInviteSelf());
            }
            resolve(
              i18n.coteacherUnknownValidationError({email: trimmedEmail})
            );
          },
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
        console.log('lfm why', errorMessage, newEmail);
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

  const isMaxCoteachers = useCallback(() => {
    return numCoteachers >= 5;
  }, [numCoteachers]);

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
    <div className={styles.add}>
      <label className={styles.label}>{i18n.coteacherEmailAddress()}</label>
      <div className={styles.form} onSubmit={handleAddEmail}>
        <input
          className={classNames(styles.input, !!addError && styles.inputError)}
          type="text"
          disabled={isMaxCoteachers()}
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
          disabled={isMaxCoteachers()}
        />
      </div>
      {getErrorOrCount()}
    </div>
  );
}

AddCoteacher.propTypes = {
  sectionId: PropTypes.number,
  numCoteachers: PropTypes.number.isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCoteachersToAdd: PropTypes.func.isRequired,
  addError: PropTypes.string,
  setAddError: PropTypes.func.isRequired,
};
