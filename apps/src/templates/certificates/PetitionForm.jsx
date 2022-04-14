import React from 'react';
import {Button, FormControl, FormGroup, Form} from 'react-bootstrap';

export default function PetitionForm() {
  return (
    <>
      <Form inline id="petition-form" style={styles.form}>
        <FormGroup controlId="petitionForm">
          <FormControl
            id="name"
            placeholder="Name"
            type="text"
            style={styles.input}
          />
          <FormControl
            id="email"
            placeholder="Email"
            type="text"
            style={styles.input}
          />
          <FormControl
            id="zip-or-country"
            placeholder="ZIP code or country"
            type="number"
            style={styles.input}
          />
          <span style={styles.label}>
            Age
            <FormControl
              id="age"
              componentClass="select"
              placeholder="-"
              style={styles.input}
            >
              {[1, 2, 3].map((age, index) => (
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
              placeholder="- Select -"
              style={styles.input}
            >
              {['- Select -', 'Student', 'Parent', 'Educator'].map(
                (profession, index) => (
                  <option key={index} value={profession}>
                    {profession}
                  </option>
                )
              )}
            </FormControl>
          </span>
          <Button bsStyle="primary" key="submit" id="submit" type="submit">
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
  input: {
    justifyContent: 'space-between',
    backgroundColor: 'rgb(226,228,227)',
    color: 'rgb(89, 89, 89, 89)',
    fontFamily: '"Gotham 4r", sans-serif',
    width: '160px',
    margin: '10px',
    padding: '5px',
    fontSize: '14px',
    lineHeight: '22px'
  }
};
