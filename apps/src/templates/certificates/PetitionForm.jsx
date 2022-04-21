import React, {useState} from 'react';
import {Button} from 'react-bootstrap';
import FieldGroup from './FieldGroup';
import {range} from 'lodash';

const PetitionForm = () => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = event => {
    event.persist();
    setValues(values => ({...values, [event.target.name]: event.target.value}));
  };

  const buildFieldGroup = (
    id,
    placeholderOrLabel,
    helpText,
    componentClass,
    children
  ) => {
    return componentClass === 'select' ? (
      <FieldGroup
        id={id}
        name={id}
        key={id}
        label={placeholderOrLabel}
        componentClass={componentClass}
        help={helpText}
        onChange={handleChange}
        value={values[id] || ''}
      >
        {children}
      </FieldGroup>
    ) : (
      <FieldGroup
        id={id}
        name={id}
        key={id}
        placeholder={placeholderOrLabel}
        type={'text'}
        help={helpText}
        onChange={handleChange}
        value={values[id] || ''}
      />
    );
  };

  const handleSubmit = e => {
    e.preventDefault();
    setErrors(values);
  };

  return (
    <>
      <form
        id="petition-form"
        className="petition-form"
        onSubmit={handleSubmit}
      >
        <div className={'petition-space'}>
          {Object.keys(errors).length > 1 && JSON.stringify(errors)}
        </div>
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
