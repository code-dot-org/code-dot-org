import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import {ProgramMapping} from './Facilitator1920Application';

export default class Section4LeadingStudents extends LabeledFormComponent {
  static labels = PageLabels.section4LeadingStudents;

  static associatedFields = [
    ...Object.keys(PageLabels.section4LeadingStudents),
    "currentlyInvolvedInCsEducation_other"
  ];

  render() {
    const program = ProgramMapping[this.props.data.program] || 'CS Program';
    return (
      <FormGroup>
        <h3>Section 4: {SectionHeaders.section4LeadingStudents}</h3>
        {this.checkBoxesWithAdditionalTextFieldsFor("currentlyInvolvedInCsEducation", {
          [TextFields.otherPleaseDescribe] : "other"
        })}
        {this.checkBoxesFor("gradesTaught")}
        {this.checkBoxesFor("experienceTeachingThisCourse", {
          label: `Do you have experience teaching the full ${program} curriculum to students? Mark all that apply.`
        })}
        {this.radioButtonsWithAdditionalTextFieldsFor("planOnTeaching", {
          [TextFields.otherWithText] : "other"
        }, {
          label: `Do you plan on teaching ${program} in the 2019-20 school year?`,
        })}
        {this.checkBoxesFor("completedPd", {
          label: `Have you participated as a teacher in Code.org's full Professional Learning Program for ${program}?`
        })}
        {this.checkBoxesWithAdditionalTextFieldsFor("facilitatorAvailability", {
          [TextFields.otherWithText] : "other"
        })}
      </FormGroup>
    );
  }
}
