import React from 'react';
import {FormGroup} from 'react-bootstrap';

import FormComponent from '../form_components/FormComponent';

export default class Demographics extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Part 4 of 4: Demographics</h4>
        {this.buildButtonsFromOptions({
          name: 'gender',
          label: "Gender:",
          type: 'radio'
        })}
        {this.buildButtonsFromOptions({
          name: 'race',
          label: "Race (check all that apply)",
          type: 'check'
        })}
        {this.buildButtonsFromOptions({
          name: 'age',
          label: "What is your age?",
          type: 'radio'
        })}
        {this.buildFieldGroup({
          name: "yearsTaught",
          type: "number",
          label: "If you are/were a K-12 teacher, how many years have you taught?",
          required: false,
        })}
        {this.buildButtonsFromOptions({
          name: 'gradesTaught',
          label: "What grade level do you teach? (check all that apply)",
          type: 'check'
        })}
        {this.buildButtonsFromOptions({
          name: 'gradesPlanningToTeach',
          label: "What grade level are you planning to teach this course to (check all that apply)?",
          type: 'check'
        })}
        {this.buildButtonsFromOptions({
          name: 'subjectsTaught',
          label: "What subjects have you taught (check all that apply)?",
          type: 'check'
        })}
        {this.props.data.subjectsTaught &&
          this.props.data.subjectsTaught.includes("Computer Science") &&
          this.buildFieldGroup({
            name: "csYearsTaught",
            type: "number",
            label: "For how many years have you taught Computer Science?",
            required: true,
            min: 0
          })
        }
      </FormGroup>
    );
  }
}

Demographics.associatedFields = [
  "gender",
  "race",
  "age",
  "gradesTaught",
  "gradesPlanningToTeach",
  "subjectsTaught",
  "csYearsTaught"
];
