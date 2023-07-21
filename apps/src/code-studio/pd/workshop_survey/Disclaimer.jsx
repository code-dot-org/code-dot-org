import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import FormComponent from '../form_components/FormComponent';

export default class Disclaimer extends FormComponent {
  render() {
    return (
      <FormGroup>
        <p>
          Your participation in this survey is voluntary but appreciated. Your
          answers will be used by Code.org, our regional partners, and our
          facilitators for program improvement. All answers you provide will be
          made anonymous by an evaluator prior to sharing, and kept in strict
          confidentiality by the evaluator.
        </p>
        <p>Please click next to begin the survey.</p>
      </FormGroup>
    );
  }
}

Disclaimer.associatedFields = [];
