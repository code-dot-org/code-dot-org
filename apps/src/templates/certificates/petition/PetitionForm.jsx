import React, {useState} from 'react';
import {Button} from 'react-bootstrap';
import FieldGroup from './FieldGroup';
import {range, forEach, mapValues} from 'lodash';
import {keyValidation} from '@cdo/apps/templates/certificates/petition/PetitionHelpers';

const PetitionForm = () => {
  // data starts with all required fields having an empty value to ensure proper validation
  const [data, setData] = useState(mapValues(keyValidation, () => ''));
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = event => {
    event.persist();
    setData(data => ({...data, [event.target.name]: event.target.value}));
  };

  const handleSubmit = e => {
    const createErrorMessage = () => {
      let errorStrings = [];
      forEach(data, (value, key) => {
        if (keyValidation[key] && !keyValidation[key].isValid(value)) {
          errorStrings.push(keyValidation[key].errorText);
        }
      });

      if (errorStrings.length === 0) {
        return '';
      } else if (errorStrings.length === 1) {
        return `Please ${errorStrings[0]}.`;
      } else {
        return `Please ${errorStrings
          .slice(0, -1)
          .join(', ')}, and ${errorStrings.slice(-1)}.`;
      }
    };

    e.preventDefault();
    setErrorMessage(createErrorMessage());
  };

  const buildFieldGroup = (
    id,
    placeholderOrLabel,
    helpText,
    componentClass,
    children
  ) =>
    buildControlledFieldGroup(
      id,
      placeholderOrLabel,
      helpText,
      componentClass,
      children,
      handleChange,
      data
    );

  return (
    <>
      <form
        id="petition-form"
        className="petition-form"
        onSubmit={handleSubmit}
      >
        <div className={'petition-space'}>{errorMessage}</div>
        {buildFieldGroup('name', 'Name')}
        {buildFieldGroup('email', 'Email', 'Only used for infrequent updates')}
        {buildFieldGroup(
          'zip-or-country',
          'ZIP code or country',
          'Enter country if outside the United States'
        )}
        {buildFieldGroup(
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
        {buildFieldGroup(
          'profession',
          'I am a',
          <a href="/privacy">See our privacy practices for children</a>,
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
