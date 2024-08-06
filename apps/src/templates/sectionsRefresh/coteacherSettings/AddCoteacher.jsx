import classNames from 'classnames';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useCallback, useState} from 'react';

import {Figcaption} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {isEmail} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';

import {convertAddCoteacherResponse} from './CoteacherUtils';

import styles from './coteacher-settings.module.scss';

const getErrorMessageFromResponse = (response, email) => {
  if (response.ok) {
    return '';
  }
  if (response.status === 404) {
    return i18n.coteacherAddNoAccount({email});
  }
  if (response.status === 403) {
    return i18n.coteacherUnableToEditCoteachers();
  }

  return response
    .json()
    .then(json => {
      if (json.error.includes('already invited')) {
        return i18n.coteacherAddAlreadyExists({email});
      }
      if (json.error.includes('section full')) {
        return i18n.coteacherAddSectionFull();
      }
      if (json.error.includes('inviting self')) {
        return i18n.coteacherCannotInviteSelf();
      }
      if (json.error.includes('already a student')) {
        return i18n.coteacherAlreadyInCourse();
      }
      console.error('Coteacher validation error', response);
      return i18n.coteacherUnknownSaveError({
        email,
      });
    })
    .catch(e => {
      console.error('Coteacher validation error', e, response);
      return i18n.coteacherUnknownSaveError({
        email,
      });
    });
};

export const earlyValidation = email => {
  if (email === '') {
    return i18n.coteacherAddNoEmail();
  }
  if (!isEmail(email)) {
    return i18n.coteacherAddInvalidEmail({email});
  }
  return null;
};

export const getInputErrorMessage = (email, coteachersToAdd, sectionId) => {
  const earlyValidationResult = earlyValidation(email);
  if (earlyValidationResult !== null) {
    return Promise.resolve(earlyValidationResult);
  }
  if (coteachersToAdd.some(coteacher => coteacher === email)) {
    return Promise.resolve(i18n.coteacherAddAlreadyExists({email}));
  }
  return fetch(
    `/api/v1/section_instructors/check?email=${encodeURIComponent(email)}` +
      (sectionId ? `&section_id=${sectionId}` : ''),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  ).then(response => getErrorMessageFromResponse(response, email));
};

export default function AddCoteacher({
  sectionId,
  numCoteachers,
  coteachersToAdd,
  setCoteachersToAdd,
  addSavedCoteacher,
  addError,
  setAddError,
  sectionMetricInformation,
  disabled,
}) {
  const [inputValue, setInputValue] = useState('');

  const saveCoteacher = useCallback(
    (email, sectionId) => {
      const earlyValidationResult = earlyValidation(email);
      if (earlyValidationResult !== null) {
        setAddError(earlyValidationResult);
        return;
      }
      fetch(`/api/v1/section_instructors`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
        },
        body: JSON.stringify({
          section_id: sectionId,
          email: email,
        }),
      })
        .then(response => {
          if (response.ok) {
            return response.json().then(json => {
              const newCoteacher = convertAddCoteacherResponse(json);
              analyticsReporter.sendEvent(
                EVENTS.COTEACHER_INVITE_SENT,
                sectionMetricInformation
              );
              addSavedCoteacher(newCoteacher);
              return '';
            });
          }
          return getErrorMessageFromResponse(response, email);
        })
        .then(errorMessage => {
          setAddError(errorMessage);
          if (errorMessage === '') {
            setInputValue('');
          } else {
            analyticsReporter.sendEvent(EVENTS.COTEACHER_EMAIL_INVALID, {
              sectionId: sectionId,
            });
          }
        });
    },
    [addSavedCoteacher, setAddError, setInputValue, sectionMetricInformation]
  );

  const validateAndAddUnsavedCoteacher = useCallback(
    email => {
      getInputErrorMessage(email, coteachersToAdd, sectionId).then(
        errorMessage => {
          if (errorMessage === '') {
            setCoteachersToAdd(existing => [email, ...existing]);
            setInputValue('');
          } else {
            analyticsReporter.sendEvent(EVENTS.COTEACHER_EMAIL_INVALID, {
              sectionId: sectionId,
            });
          }
          setAddError(errorMessage);
        }
      );
    },
    [setAddError, setInputValue, setCoteachersToAdd, coteachersToAdd, sectionId]
  );

  const handleAddEmail = useCallback(
    e => {
      e.preventDefault();
      const newEmail = inputValue.trim();
      if (!sectionId) {
        validateAndAddUnsavedCoteacher(newEmail);
      } else {
        // Save coteacher only if we are editing an existing section.
        return saveCoteacher(newEmail, sectionId);
      }
    },
    [validateAndAddUnsavedCoteacher, inputValue, sectionId, saveCoteacher]
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

  const isMaxCoteachers = numCoteachers >= 5;

  const getErrorOrCount = () => {
    if (disabled) {
      return null;
    }

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
      <label className={styles.addLabel}>{i18n.coteacherEmailAddress()}</label>
      <div className={styles.form} onSubmit={handleAddEmail}>
        <input
          className={classNames(styles.input, !!addError && styles.inputError)}
          type="text"
          disabled={isMaxCoteachers || !!disabled}
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
          disabled={isMaxCoteachers || !!disabled}
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
  addSavedCoteacher: PropTypes.func.isRequired,
  setAddError: PropTypes.func.isRequired,
  sectionMetricInformation: PropTypes.object,
  disabled: PropTypes.bool,
};
