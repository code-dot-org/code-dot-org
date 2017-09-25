import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';

const LABELS = {
  "gender": "Gender",
  "race": "Race (check all that apply)",
  "age": "What is your age?",
  "yearsTaught": "If you are/were a K-12 teacher, how many years have you taught?",
  "gradesTaught": "What grade level(s) do you teach? (select all that apply)",
  "gradesPlanningToTeach": "What grade level(s) are you planning to teach this course to? (select all that apply)",
  "subjectsTaught": "What subjects have you taught? (select all that apply)",
  "highestEducation": "What is your highest level of education?",
  "degreeField": "What field of study is/are your degree(s) in?",
  "yearsTaughtStem": "For how many years have you taught a STEM subject?",
  "yearsTaughtCs": "For how many years have you taught Computer Science?",
  "haveRequiredLicenses": "Do you have the required licenses/certifications to teach CS in your school district?"
};

export default class Demographics extends FormComponent {
  render() {
    return (
      <FormGroup>
        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: LABELS.gender,
            name: "gender",
            required: true,
            type: 'radio',
          })
        }

        {this.buildButtonsFromOptions({
          label: LABELS.race,
          name: "race",
          required: true,
          type: 'check',
        })}

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: LABELS.age,
            name: "age",
            required: true,
            type: 'radio',
          })
        }

        {this.buildFieldGroup({
          label: LABELS.yearsTaught,
          name: "yearsTaught",
          required: false,
          type: "number",
          min: 0
        })}

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: LABELS.gradesTaught,
            name: "gradesTaught",
            required: true,
            type: 'check',
          })
        }

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: LABELS.gradesPlanningToTeach,
            name: "gradesPlanningToTeach",
            required: true,
            type: 'check',
          })
        }

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: LABELS.subjectsTaught,
            name: "subjectsTaught",
            required: true,
            type: 'check',
          })
        }

        {this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: LABELS.highestEducation,
            name: "highestEducation",
            required: true,
            type: 'radio',
          })
        }

        {this.props.isLocalSummer &&
          this.buildSelectFieldGroupFromOptions({
            label: LABELS.degreeField,
            name: "degreeField",
            placeholder: "-",
            required: true,
          })
        }

        {this.props.isLocalSummer &&
          this.buildSelectFieldGroupFromOptions({
            label: LABELS.yearsTaughtStem,
            name: "yearsTaughtStem",
            placeholder: "-",
            required: true,
          })
        }

        {/*
          The "how many years have you taught CS question is always shown on the
          local summer workshops survey, and conditionally shown on the regular
          survey based on whether or not they self-report as having taught CS
        */}
        {(
          this.props.isLocalSummer ||
          (
            this.props.data.subjectsTaught &&
            this.props.data.subjectsTaught.includes("Computer Science")
          )
         ) &&
          this.buildSelectFieldGroupFromOptions({
            label: LABELS.yearsTaughtCs,
            name: "yearsTaughtCs",
            placeholder: "-",
            required: true,
          })
        }

        {this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: LABELS.haveRequiredLicenses,
            name: "haveRequiredLicenses",
            required: true,
            type: 'radio',
          })
        }
      </FormGroup>
    );
  }
}

Demographics.associatedFields = Object.keys(LABELS);
