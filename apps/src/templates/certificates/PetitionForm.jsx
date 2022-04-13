import React from 'react';
import {Button, FormGroup} from 'react-bootstrap';

export default function PetitionForm() {
  return (
    <>
      <form id="petition-form" style={styles.form}>
        <FormGroup>
          <input
            id="name"
            placeholder="Name"
            type="text"
            style={styles.input}
          />
          <input
            id="email"
            placeholder="Email"
            type="text"
            style={styles.input}
          />
          <input
            id="zip-or-country"
            placeholder="ZIP code or country"
            type="number"
            style={styles.input}
          />
          <div id="age">
            Age
            <select defaultValue="-" style={styles.input}>
              {['-', 1, 2, 3].map((age, index) => (
                <option key={index} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>
          <div id="profession">
            I am a
            <select defaultValue="- Select -" style={styles.input}>
              {['- Select -', 'Student', 'Parent', 'Educator'].map(
                (profession, index) => (
                  <option key={index} value={profession}>
                    {profession}
                  </option>
                )
              )}
            </select>
          </div>
          <Button bsStyle="primary" key="submit" id="submit" type="submit">
            I agree
          </Button>
        </FormGroup>
      </form>
    </>
  );
}

const styles = {
  form: {
    flex: '1 100%'
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
