import React from 'react';
import {Button, FormControl, FormGroup, Form, HelpBlock} from 'react-bootstrap';
import {range, assign} from 'lodash';
import PropTypes from 'prop-types';

const FieldGroup = ({id, label, help, componentClass, children, ...props}) => {
  const fieldStyle = assign(styles.elementText, styles.field, styles.dropdown);
  return (
    <FormGroup style={styles.element} controlId={id}>
      {label && <span style={styles.label}>{label}</span>}
      <FormControl
        componentClass={componentClass}
        style={fieldStyle}
        {...props}
      >
        {children}
      </FormControl>
      {help && <HelpBlock style={styles.help}>{help}</HelpBlock>}
    </FormGroup>
  );
};

FieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  help: PropTypes.string,
  children: PropTypes.node,
  componentClass: PropTypes.string
};

const PetitionForm = () => (
  <>
    <Form inline id="petition-form" style={styles.form}>
      <FieldGroup id="name" placeholder="Name" type="text" />
      <FieldGroup id="email" placeholder="Email" type="text" />
      <FieldGroup
        id="zip-or-country"
        placeholder="ZIP code or country"
        type="number"
      />
      <FieldGroup id="zip-or-country" label="Age" componentClass="select">
        {['-', ...range(1, 101)].map((age, index) => (
          <option key={index} value={age}>
            {age}
          </option>
        ))}
      </FieldGroup>
      <FieldGroup id="profession" label="I am a" componentClass="select">
        {[
          '- Select -',
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
      </FieldGroup>
      <Button
        style={styles.element}
        bsStyle="primary"
        key="submit"
        id="submit"
        type="submit"
      >
        I agree
      </Button>
    </Form>
  </>
);

const styles = {
  form: {
    display: 'flex',
    flexFlow: 'row wrap',
    flex: '1 100%',
    justifyContent: 'space-around'
  },
  element: {
    margin: '10px',
    padding: '5px'
  },
  elementText: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: '14px'
  },
  label: {
    whiteSpace: 'nowrap',
    color: 'rgb(91,103,112)',
    width: '100px'
  },
  field: {
    color: 'rgb(89, 89, 89, 89)',
    backgroundColor: 'rgb(226,228,227)'
  },
  input: {
    width: '160px'
  },
  dropdown: {
    width: '120px',
    marginLeft: '4px'
  },
  help: {
    whiteSpace: 'nowrap',
    fontSize: '12px',
    lineHeight: '18px',
    color: 'rgb(91,103,112)',
    marginLeft: '10px'
  }
};

export default PetitionForm;
