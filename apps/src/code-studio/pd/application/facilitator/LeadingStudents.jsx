import React from 'react';
import {FormGroup} from 'react-bootstrap';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitatorApplicationConstants';
import {CSF} from '../ApplicationConstants';

export default class LeadingStudents extends LabeledFormComponent {
  static labels = PageLabels.leadingStudents;

  static associatedFields = [
    ...Object.keys(PageLabels.leadingStudents),
    'currentlyInvolvedInCsEducation_other'
  ];

  render() {
    const program = this.props.data.program || 'CS Program';
    return (
      <FormGroup>
        <h3>Section 4: {SectionHeaders.leadingStudents}</h3>
        {this.checkBoxesWithAdditionalTextFieldsFor(
          'currentlyInvolvedInCsEducation',
          {
            [TextFields.otherPleaseDescribe]: 'other'
          }
        )}
        {this.checkBoxesFor('gradesTaught')}
        {this.checkBoxesFor('experienceTeachingThisCourse', {
          label: `Do you have experience teaching the full ${program} curriculum to students? Mark all that apply.`
        })}
        {this.radioButtonsWithAdditionalTextFieldsFor(
          'planOnTeaching',
          {
            [TextFields.otherWithText]: 'other'
          },
          {
            label: `Do you plan on teaching ${program} in the 2019-20 school year?`
          }
        )}
        {program !== CSF &&
          this.radioButtonsFor('csdCspCompletedPd', {
            label: `Have you participated as a teacher in Code.org's full Professional Learning Program for ${program}?`
          })}
        {program === CSF && this.radioButtonsFor('csfPreviousWorkshop')}
        {this.checkBoxesWithAdditionalTextFieldsFor('facilitatorAvailability', {
          [TextFields.otherWithText]: 'other'
        })}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];
    const program = data.program || 'CS Program';

    if (program === CSF) {
      requiredFields.push('csfPreviousWorkshop');
    } else {
      requiredFields.push('csdCspCompletedPd');
    }

    return requiredFields;
  }
}
