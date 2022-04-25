import React, {useState, useCallback} from 'react';
import {Button} from 'react-bootstrap';
import {range, mapValues, without} from 'lodash';
import {
  keyValidation,
  getInvalidFields,
  getErrorMessage
} from '@cdo/apps/templates/certificates/petition/petitionHelpers';
import ControlledFieldGroup from '@cdo/apps/templates/certificates/petition/ControlledFieldGroup';

const PetitionForm = () => {
  // data starts with all required fields having an empty value to ensure proper validation
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
      Object.entries(data).forEach(field => {
        let value = data[field];
        if (typeof value === 'string') {
          setData({...data, [field]: value.trim()});
        }
      });
      setInvalidFields(getInvalidFields(data));
      setErrorMessage(getErrorMessage(data));
    },
    [data]
  );

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
          placeholderOrLabel="Name"
          isErrored={invalidFields.includes('name')}
          onChange={handleChange}
          value={data['name'] || ''}
        />
        <ControlledFieldGroup
          id="email"
          placeholderOrLabel="Email"
          isErrored={invalidFields.includes('email')}
          helpText="Only used for infrequent updates"
          onChange={handleChange}
          value={data.email || ''}
        />
        <ControlledFieldGroup
          id="zip-or-country"
          placeholderOrLabel="ZIP code or country"
          isErrored={invalidFields.includes('zip-or-country')}
          helpText="Enter country if outside the United States"
          onChange={handleChange}
          value={data['zip-or-country'] || ''}
        />
        <ControlledFieldGroup
          id="age"
          placeholderOrLabel="Age"
          isErrored={invalidFields.includes('age')}
          helpText={
            <a href="/privacy">See our privacy practices for children</a>
          }
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
          placeholderOrLabel="I am a"
          isErrored={invalidFields.includes('profession')}
          componentClass="select"
          onChange={handleChange}
          value={data['profession'] || ''}
        >
          {[
            '-',
            'Student',
            'Parent',
            'Educator',
            'School Administrator',
            'Software Engineer',
            'None of the Above'
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
          I agree
        </Button>
      </form>
    </>
  );
};

export default PetitionForm;
