import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';

const LABELS = {
  "race": "Race (check all that apply)",
  "yearsTaught": "If you are/were a K-12 teacher, how many years have you taught?",
  "highestEducation": "What is your highest level of education?",
  "degreeField": "What field of study is/are your degree(s) in?",
  "yearsTaughtStem": "For how many years have you taught a STEM subject?",
  "yearsTaughtCs": "For how many years have you taught Computer Science?",
  "haveRequiredLicenses": "Do you have the required licenses / certifications to teach CS in your school district?"
};

export default class Demographics extends FormComponent {
  render() {
    return (
      <FormGroup>
        {this.buildButtonsFromOptions({
          label: LABELS.race,
          name: "race",
          required: true,
          type: 'check',
        })}

        {this.buildFieldGroup({
          label: LABELS.yearsTaught,
          name: "yearsTaught",
          required: false,
          type: "number",
          min: 0
        })}

        {this.buildButtonsFromOptions({
          label: LABELS.highestEducation,
          name: "highestEducation",
          required: true,
          type: 'radio',
        })}

        {this.buildSelectFieldGroupFromOptions({
          label: LABELS.degreeField,
          name: "degreeField",
          placeholder: "-",
          required: true,
        })}

        {this.buildSelectFieldGroupFromOptions({
          label: LABELS.yearsTaughtStem,
          name: "yearsTaughtStem",
          placeholder: "-",
          required: true,
        })}

        {this.buildSelectFieldGroupFromOptions({
          label: LABELS.yearsTaughtCs,
          name: "yearsTaughtCs",
          placeholder: "-",
          required: true,
        })}

        {this.buildButtonsFromOptions({
          label: LABELS.haveRequiredLicenses,
          name: "haveRequiredLicenses",
          required: true,
          type: 'radio',
        })}
      </FormGroup>
    );
  }
}

Demographics.associatedFields = Object.keys(LABELS);
