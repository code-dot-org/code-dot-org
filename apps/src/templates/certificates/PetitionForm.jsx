import React from 'react';
import {Button, Form, Label} from 'react-bootstrap';
import FieldGroup from './FieldGroup';
import {range} from 'lodash';

const PetitionForm = () => (
  <>
    <Form inline id="petition-form" className="petition-form">
      <Label bsStyle="danger" className="petition-error">
        Warning
      </Label>
      <FieldGroup id="name" placeholder="Name" type="text" />
      <FieldGroup
        id="email"
        placeholder="Email"
        type="text"
        help="Only used for infrequent updates"
      />
      <FieldGroup
        id="zip-or-country"
        placeholder="ZIP code or country"
        type="text"
        help="Enter country if outside the United States"
      />
      <FieldGroup
        id="age"
        label="Age"
        componentClass="select"
        help={<a href="/privacy">See our privacy practices for children</a>}
      >
        {['-', ...range(1, 101)].map((age, index) => (
          <option key={index} value={age}>
            {age}
          </option>
        ))}
      </FieldGroup>
      <FieldGroup id="profession" label="I am a" componentClass="select">
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
      </FieldGroup>
      <Button
        className="petition-button"
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

export default PetitionForm;
