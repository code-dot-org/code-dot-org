import React, {useState, useCallback} from 'react';
import {Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {range, mapValues, without, find} from 'lodash';
import i18n from '@cdo/locale';
import $ from 'jquery';
import {
  keyValidation,
  getInvalidFields,
  getErrorMessage,
  getAgeSafeData,
  professionOptions,
} from '@cdo/apps/templates/certificates/petition/petitionHelpers';
import ControlledFieldGroup from '@cdo/apps/templates/certificates/petition/ControlledFieldGroup';
import PropTypes from 'prop-types';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const PetitionForm = ({tutorial}) => {
  // data starts with all fields having an empty value to ensure consistent data shape
  const [data, setData] = useState(mapValues(keyValidation, () => ''));
  const [invalidFields, setInvalidFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = useCallback(
    e => {
      e.persist();
      setData(data => ({...data, [e.target.name]: e.target.value}));
      setInvalidFields(without(invalidFields, e.target.name)); // Remove error from field until next submit
    },
    [invalidFields]
  );

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();

      let sanitizedData = {};
      Object.keys(data).forEach(field => {
        if (typeof data[field] === 'string') {
          sanitizedData = {...sanitizedData, [field]: data[field].trim()};
        } else {
          sanitizedData = {...sanitizedData, [field]: data[field]};
        }
      });
      // ensure profession data is sent in english
      sanitizedData.role_s =
        find(professionOptions, {text: data.role_s})?.dataString || 'other';

      const currentInvalidFields = getInvalidFields(sanitizedData);
      if (currentInvalidFields.length !== 0) {
        setInvalidFields(currentInvalidFields);
        setErrorMessage(getErrorMessage(sanitizedData));
      } else {
        setErrorMessage('');
        // Do not send email or name server-side for under sixteen users to protect privacy.
        sendDataToEndpoint(getAgeSafeData(sanitizedData));
        ga('send', 'event', 'studio_petition', 'click', {
          tutorial: tutorial,
        });
      }
    },
    [data, tutorial]
  );

  const sendDataToEndpoint = data => {
    const handleSuccessfulSubmit = () => {
      window.location.href = pegasus('/promote/thanks');
    };
    const handleFailedSubmit = () => {
      setErrorMessage(i18n.formServerError());
    };

    $.ajax({
      url: '/v2/forms/Petition',
      type: 'post',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify(data),
    })
      .done(handleSuccessfulSubmit)
      .fail(handleFailedSubmit);
  };

  return (
    <>
      <form
        id="petition-form"
        className="petition-form"
        onSubmit={handleSubmit}
      >
        <div className={'petition-space'}>{errorMessage}</div>
        <ControlledFieldGroup
          id="name"
          name="name_s"
          placeholderOrLabel={i18n.name()}
          isErrored={invalidFields.includes('name_s')}
          onChange={handleChange}
          value={data.name_s || ''}
        />
        <ControlledFieldGroup
          id="email"
          name="email_s"
          placeholderOrLabel={i18n.email()}
          isErrored={invalidFields.includes('email_s')}
          helpText={i18n.usedForInfrequentUpdates()}
          onChange={handleChange}
          value={data.email_s || ''}
        />
        <ControlledFieldGroup
          id="zip-or-country"
          name="zip_code_or_country_s"
          placeholderOrLabel={i18n.zipOrCountry()}
          isErrored={invalidFields.includes('zip_code_or_country_s')}
          helpText={i18n.enterCountry()}
          onChange={handleChange}
          value={data.zip_code_or_country_s || ''}
        />
        <ControlledFieldGroup
          id="age"
          name="age_i"
          placeholderOrLabel={i18n.age()}
          isErrored={invalidFields.includes('age_i')}
          helpText={
            <a href={pegasus('/privacy')}>
              {i18n.privacyPracticesForChildren()}
            </a>
          }
          componentClass="select"
          onChange={handleChange}
          value={data.age_i || ''}
        >
          {['-', ...range(1, 101)].map((age, index) => (
            <option key={index} value={age}>
              {age}
            </option>
          ))}
        </ControlledFieldGroup>
        <ControlledFieldGroup
          id="profession"
          name="role_s"
          placeholderOrLabel={i18n.iAmA()}
          isErrored={invalidFields.includes('role_s')}
          componentClass="select"
          onChange={handleChange}
          value={data.role_s || ''}
        >
          {professionOptions.map(({text}) => (
            <option key={text} value={text}>
              {text}
            </option>
          ))}
        </ControlledFieldGroup>
        <Button
          className="petition-button"
          bsStyle="primary"
          key="submit"
          id="submit"
          type="submit"
        >
          {i18n.iAgree()}
        </Button>
      </form>
    </>
  );
};

PetitionForm.propTypes = {
  tutorial: PropTypes.string,
};

export default PetitionForm;
