import React, {useState} from 'react';
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

  const handleChange = e => {
    e.persist();
    setData(data => ({...data, [e.target.name]: e.target.value}));
    setInvalidFields(without(invalidFields, e.target.name)); // Remove error from field until next submit
  };

  const handleSubmit = e => {
    e.preventDefault();
    Object.entries(data).forEach(field => {
      let value = data[field];
      if (typeof value === 'string') {
        setData({...data, [field]: value.trim()});
      }
    });
    setInvalidFields(getInvalidFields(data));
    setErrorMessage(getErrorMessage(data));
  };

  const buildControlledFieldGroup = (
    id,
    placeholderOrLabel,
    helpText,
    componentClass,
    children
  ) => (
    <ControlledFieldGroup
      id={id}
      placeholderOrLabel={placeholderOrLabel}
      helpText={helpText}
      componentClass={componentClass}
      onChange={handleChange}
      isErrored={invalidFields.includes(id)}
      value={data[id] || ''}
    >
      {children}
    </ControlledFieldGroup>
  );

  return (
    <>
      <form
        id="petition-form"
        className="petition-form"
        onSubmit={handleSubmit}
      >
        <div className={'petition-space'}>{errorMessage}</div>
        {buildControlledFieldGroup('name', 'Name')}
        {buildControlledFieldGroup(
          'email',
          'Email',
          'Only used for infrequent updates'
        )}
        {buildControlledFieldGroup(
          'zip-or-country',
          'ZIP code or country',
          'Enter country if outside the United States'
        )}
        {buildControlledFieldGroup(
          'age',
          'Age',
          <a href="/privacy">See our privacy practices for children</a>,
          'select',
          ['-', ...range(1, 101)].map((age, index) => (
            <option key={index} value={age}>
              {age}
            </option>
          ))
        )}
        {buildControlledFieldGroup(
          'profession',
          'I am a',
          undefined,
          'select',
          [
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
          ))
        )}
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
