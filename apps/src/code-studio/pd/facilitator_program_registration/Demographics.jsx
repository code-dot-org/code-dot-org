import React from 'react';
import {
  Button,
  FormGroup
} from 'react-bootstrap';

import ProgramRegistrationComponent from './ProgramRegistrationComponent';

export default class Demographics extends ProgramRegistrationComponent {
  render() {
    return (
      <FormGroup>
        <h4>Part 4 of 4: Demographics</h4>
        {this.buildButtonsFromOptions(
          'gender',
          "Gender:",
          'radio'
        )}
        {this.buildButtonsFromOptions(
          'race',
          "Race (check all that apply)",
          'check'
        )}
        {this.buildButtonsFromOptions(
          'age',
          "What is your age?",
          'radio'
        )}
        {this.buildFieldGroup({
          name: "yearsTaught",
          type: "number",
          label: "If you are/were a K-12 teacher, how many years have you taught?",
          required: false,
        })}
        {this.buildButtonsFromOptions(
          'gradesTaught',
          "What grade level do you teach? (check all that apply)",
          'check'
        )}
        {this.buildButtonsFromOptions(
          'gradesPlanningToTeach',
          "What grade level are you planning to teach this course to (check all that apply)?",
          'check'
        )}
        {this.buildButtonsFromOptions(
          'subjectsTaught',
          "What subjects have you taught (check all that apply)?",
          'check'
        )}
        {this.buildFieldGroup({
          name: "csYearsTaught",
          type: "number",
          label: "For how many years have you taught Computer Science?",
          required: true,
        })}
        <FormGroup>
          <Button bsStyle="primary" type="submit">
            Submit
          </Button>
        </FormGroup>
      </FormGroup>
    );
  }
}
