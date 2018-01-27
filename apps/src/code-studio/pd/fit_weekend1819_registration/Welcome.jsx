import React from 'react';
import {FormGroup} from 'react-bootstrap';
import LabeledFormComponent from '../form_components/LabeledFormComponent';

export default class Welcome extends LabeledFormComponent {
  render() {
    return (
      <FormGroup>
        <p>
          Congratulations on your acceptance to Code.org’s Facilitator Development
          Program for {this.props.course}! Please complete this registration
          form <strong>within two weeks</strong>, and
          contact <a href="mailto:facilitators@code.org">facilitators@code.org</a>
          with any questions.
        </p>
      </FormGroup>
    );
  }
}
