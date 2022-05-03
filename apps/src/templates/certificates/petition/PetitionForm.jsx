import React, {useState, useCallback} from 'react';
import {Button} from 'react-bootstrap';
import {range, mapValues, without} from 'lodash';
import i18n from '@cdo/locale';
import $ from 'jquery';
import {
  keyValidation,
  getInvalidFields,
  getErrorMessage,
  getAgeSafeData
} from '@cdo/apps/templates/certificates/petition/petitionHelpers';
import ControlledFieldGroup from '@cdo/apps/templates/certificates/petition/ControlledFieldGroup';
import PropTypes from 'prop-types';
/* global ga */

const PetitionForm = ({gaPagePath}) => {
  // data starts with all required fields having an empty value to ensure proper validation
  const [data, setData] = useState(mapValues(keyValidation, () => ''));
  const [invalidFields, setInvalidFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = useCallback(
    e => {
      e.persist();
      setData(data => ({...data, [e.target.name]: e.target.value}));
      console.log('setting data to', {
        ...data,
        [e.target.name]: e.target.value
      });
      setInvalidFields(without(invalidFields, e.target.name)); // Remove error from field until next submit
    },
    [invalidFields]
  );

  const handleSubmit = useCallback(
    e => {
      console.log('SUBMIT ATTEMPTED!!', data);
      e.preventDefault();

      let sanitizedData = data;
      Object.entries(data).forEach(field => {
        let value = data[field];
        if (typeof value === 'string') {
          sanitizedData = {...sanitizedData, [field]: value.trim()};
        }
      });
      setData(sanitizedData);

      const currentInvalidFields = getInvalidFields(sanitizedData);
      if (currentInvalidFields.length !== 0) {
        setInvalidFields(currentInvalidFields);
        setErrorMessage(getErrorMessage(sanitizedData));
      } else {
        // Do not send email or name server-side for under sixteen users to protect privacy.
        sendDataToEndpoint(getAgeSafeData(sanitizedData));
        ga('send', 'event', 'petition', 'click', {
          page: gaPagePath
        });
      }
    },
    [data]
  );

  const sendDataToEndpoint = data => {
    const handleSuccessfulSubmit = () => {
      console.log('submit successful');
      //  TODO: Redirect to /promote/thanks
      // window.location.href = "/promote/thanks";
    };
    const handleFailedSubmit = () => {
      console.log('submit failed');
      // TODO: Show error message
    };

    $.ajax({
      url: '/forms/Petition',
      type: 'post',
      dataType: 'json',
      data: data
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
          placeholderOrLabel={i18n.name()}
          isErrored={invalidFields.includes('name')}
          onChange={handleChange}
          value={data['name'] || ''}
        />
        <ControlledFieldGroup
          id="email"
          placeholderOrLabel={i18n.email()}
          isErrored={invalidFields.includes('email')}
          helpText={i18n.usedForInfrequentUpdates()}
          onChange={handleChange}
          value={data.email || ''}
        />
        <ControlledFieldGroup
          id="zip-or-country"
          placeholderOrLabel={i18n.zipOrCountry()}
          isErrored={invalidFields.includes('zip-or-country')}
          helpText={i18n.enterCountry()}
          onChange={handleChange}
          value={data['zip-or-country'] || ''}
        />
        <ControlledFieldGroup
          id="age"
          placeholderOrLabel={i18n.age()}
          isErrored={invalidFields.includes('age')}
          helpText={<a href="/privacy">{i18n.privacyPracticesForChildren()}</a>}
          componentClass="select"
          onChange={handleChange}
          value={data['age'] || ''}
        >
          {['-', ...range(1, 101)].map((age, index) => (
            <option key={index} value={age}>
              {age}
            </option>
          ))}
        </ControlledFieldGroup>
        <ControlledFieldGroup
          id="profession"
          placeholderOrLabel={i18n.iAmA()}
          isErrored={invalidFields.includes('profession')}
          componentClass="select"
          onChange={handleChange}
          value={data['profession'] || ''}
        >
          {[
            '-',
            i18n.student(),
            i18n.parent(),
            i18n.educator(),
            i18n.administrator(),
            i18n.softwareEngineer(),
            i18n.noneOfTheAbove()
          ].map((profession, index) => (
            <option key={index} value={profession}>
              {profession}
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
  gaPagePath: PropTypes.string.isRequired // in the form '/congrats/coursea-2020' to be sent to ga
};

export default PetitionForm;
