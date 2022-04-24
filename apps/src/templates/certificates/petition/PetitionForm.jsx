import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {range, mapValues} from 'lodash';
import {
  createErrorMessage,
  keyValidation
} from '@cdo/apps/templates/certificates/petition/petitionHelpers';
import ControlledFieldGroup from '@cdo/apps/templates/certificates/petition/ControlledFieldGroup';

const PetitionForm = () => {
  // data starts with all required fields having an empty value to ensure proper validation
  const [data, setData] = useState(mapValues(keyValidation, () => ''));
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = useCallback(e => {
    e.persist();
    setData(data => ({...data, [e.target.name]: e.target.value}));
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    setErrorMessage(createErrorMessage(data));
  };

  const PetitionFieldGroup = useCallback(
    ({id, ...props}) => (
      <ControlledFieldGroup
        id={id}
        onChange={handleChange}
        value={data[id] || ''}
        {...props}
      />
    ),
    [handleChange, data]
  );
  PetitionForm.propTypes = {id: PropTypes.string.isRequired};

  return (
    <>
      <form
        id="petition-form"
        className="petition-form"
        onSubmit={handleSubmit}
      >
        <div className={'petition-space'}>{errorMessage}</div>
        <PetitionFieldGroup id="name" placeholderOrLabel="Name" />
        <PetitionFieldGroup
          id="email"
          placeholderOrLabel="Email"
          helpText="Only used for infrequent updates"
        />
        <PetitionFieldGroup
          id="zip-or-country"
          placeholderOrLabel="ZIP code or country"
          helpText="Enter country if outside the United States"
        />
        <PetitionFieldGroup
          id="age"
          placeholderOrLabel="Age"
          helpText={
            <a href="/privacy">See our privacy practices for children</a>
          }
          componentClass="select"
        >
          {['-', ...range(1, 101)].map((age, index) => (
            <option key={index} value={age}>
              {age}
            </option>
          ))}
        </PetitionFieldGroup>
        <PetitionFieldGroup
          id="profession"
          placeholderOrLabel="I am a"
          componentClass="select"
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
        </PetitionFieldGroup>
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
