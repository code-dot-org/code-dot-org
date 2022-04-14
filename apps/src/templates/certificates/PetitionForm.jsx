import React from 'react';
import {Button, FormControl, FormGroup, Form} from 'react-bootstrap';
import {range} from 'lodash';

export default function PetitionForm() {
  return (
    <>
      <Form inline id="petition-form" style={styles.form}>
        <FormGroup controlId="petitionForm">
          <FormControl
            id="name"
            placeholder="Name"
            type="text"
            style={{...styles.field, ...styles.input}}
          />
          <FormControl
            id="email"
            placeholder="Email"
            type="text"
            style={{...styles.field, ...styles.input}}
          />
          <FormControl
            id="zip-or-country"
            placeholder="ZIP code or country"
            type="number"
            style={{...styles.field, ...styles.input}}
          />
          <span style={styles.label}>
            Age
            <FormControl
              id="age"
              componentClass="select"
              style={{...styles.field, ...styles.dropdown}}
            >
              {['-', ...range(1, 101)].map((age, index) => (
                <option key={index} value={age}>
                  {age}
                </option>
              ))}
            </FormControl>
          </span>
          <span style={styles.label}>
            I am a
            <FormControl
              id="profession"
              componentClass="select"
              style={{...styles.field, ...styles.dropdown}}
            >
              {[
                '- Select -',
                'Student',
                'Parent',
                'Educator',
                'Software Engineer',
                'None of the Above'
              ].map((profession, index) => (
                <option key={index} value={profession}>
                  {profession}
                </option>
              ))}
            </FormControl>
          </span>
          <Button
            style={styles.button}
            bsStyle="primary"
            key="submit"
            id="submit"
            type="submit"
          >
            I agree
          </Button>
        </FormGroup>
      </Form>
    </>
  );
}

const styles = {
  form: {
    flex: '1 100%'
  },
  label: {
    whiteSpace: 'nowrap',
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: '14px',
    color: 'rgb(91,103,112)'
  },
  field: {
    justifyContent: 'space-between',
    backgroundColor: 'rgb(226,228,227)',
    color: 'rgb(89, 89, 89, 89)',
    fontFamily: '"Gotham 4r", sans-serif',
    margin: '10px',
    padding: '5px',
    fontSize: '14px',
    lineHeight: '22px'
  },
  input: {
    width: '160px'
  },
  dropdown: {
    width: '100px'
  }
};
