import React from 'react';

import {
  FormGroup,
} from 'react-bootstrap';

import LabeledFormComponent from '../form_components/LabeledFormComponent';

export default class Confirmation extends LabeledFormComponent {
  static associatedFields = [];

  render() {
    return (
      <FormGroup>
        <p>
          We're excited you’re planning to join us this summer! You will receive
          more information about travel approximately six weeks before the FiT
          Weekend. In the meantime, please <strong>do not</strong> book your flight,
          and make sure to contact <a href="mailto:facilitators@code.org">facilitators@code.org</a> with any questions. We look
          forward to meeting you this summer!
        </p>
      </FormGroup>
    );
  }
}

