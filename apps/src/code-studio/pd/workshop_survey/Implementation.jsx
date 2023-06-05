import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import FormComponent from '../form_components/FormComponent';

const LABELS = {
  hoursPerWeek:
    'Roughly how many hours per week do you get with each section of students to teach CS Discoveries?',
  weeksPerYear:
    'How many weeks will you be spending on CS Discoveries with each section of students this year?',
  courseStructure:
    'Which of the following best describes how you are teaching CS Discoveries with each section of students?',
  unitsPlanningToTeach:
    'Which units in CS Discoveries do you plan to teach to your sections this year?',
  sameStudentsMultipleYears:
    'Will you see the same students for multiple years?',
  unitsInLaterYears:
    'Please indicate which units you will teach in the second or third year:',
  combiningCurricula:
    'Are you combining CS Discoveries with other curricula you teach in the same class? If so, what else are you teaching? (check all that apply)',
  cteCredit:
    'Can students get CTE credit for taking CS Discoveries in your school?',
  csdRequired:
    'At your school, is your CS Discoveries course required or optional?',
};

export default class Implementation extends FormComponent {
  render() {
    return (
      <FormGroup>
        <p>
          Now that school has started, please answer these questions so we can
          understand how you will be using CS Discoveries in your class this
          year. If you have multiple sections that each use it differently,
          answer the questions below for the section that will have the longest
          implementation of CS Discoveries.
        </p>

        {this.buildButtonsFromOptions({
          label: LABELS.hoursPerWeek,
          name: 'hoursPerWeek',
          required: true,
          type: 'radio',
        })}

        {this.buildButtonsFromOptions({
          label: LABELS.weeksPerYear,
          name: 'weeksPerYear',
          required: true,
          type: 'radio',
        })}

        {this.buildButtonsFromOptions({
          label: LABELS.courseStructure,
          name: 'courseStructure',
          required: true,
          type: 'radio',
        })}
        {this.props.data.courseStructure &&
          this.props.data.courseStructure.includes('Other') &&
          this.buildFieldGroup({
            label: 'Other format?',
            name: 'courseStructureOther',
            type: 'text',
          })}

        {this.buildButtonsFromOptions({
          label: LABELS.unitsPlanningToTeach,
          name: 'unitsPlanningToTeach',
          required: true,
          type: 'check',
        })}

        {this.buildButtonsFromOptions({
          label: LABELS.sameStudentsMultipleYears,
          name: 'sameStudentsMultipleYears',
          required: true,
          type: 'radio',
        })}
        {this.props.data.sameStudentsMultipleYears &&
          this.props.data.sameStudentsMultipleYears.includes(
            'I have the same students for multiple years.'
          ) &&
          this.buildButtonsFromOptions({
            label: LABELS.unitsInLaterYears,
            name: 'unitsInLaterYears',
            required: true,
            type: 'check',
          })}

        {this.buildButtonsFromOptions({
          label: LABELS.combiningCurricula,
          name: 'combiningCurricula',
          required: true,
          type: 'check',
        })}
        {this.props.data.combiningCurricula &&
          this.props.data.combiningCurricula.includes('Other') &&
          this.buildFieldGroup({
            label: 'Other curricula?',
            name: 'combiningCurriculaOther',
            type: 'text',
          })}

        {this.buildButtonsFromOptions({
          label: LABELS.cteCredit,
          name: 'cteCredit',
          required: true,
          type: 'radio',
        })}
        {this.props.data.cteCredit &&
          this.props.data.cteCredit.includes('Other') &&
          this.buildFieldGroup({
            label: 'Other?',
            name: 'cteOther',
            type: 'text',
          })}

        {this.buildButtonsFromOptions({
          label: LABELS.csdRequired,
          name: 'csdRequired',
          required: true,
          type: 'radio',
        })}
        {this.props.data.csdRequired &&
          this.props.data.csdRequired.includes('Other') &&
          this.buildFieldGroup({
            label: 'Other?',
            name: 'csdRequiredOther',
            type: 'text',
          })}
      </FormGroup>
    );
  }
}

Implementation.associatedFields = Object.keys(LABELS);
