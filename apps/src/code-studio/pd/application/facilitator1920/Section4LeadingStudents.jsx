import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';

export default class Section4LeadingStudents extends LabeledFormComponent {
  static labels = PageLabels.section4LeadingStudents;

  static associatedFields = [
    ...Object.keys(PageLabels.section4LeadingStudents),
    "currentlyInvolvedInCsEducation_other"
  ];

  program() {
    switch (this.props.data.program) {
      case 'CS Fundamentals (K - 5th grade)':
        return 'CS Fundamentals';
      case 'CS Discoveries (6 - 10th grade)':
        return 'CS Discoveries';
      case 'CS Principles (9 - 12th grade)':
        return 'CS Principles';
    }
  }

  render() {
    return (
      <FormGroup>
        <h3>Section 4: {SectionHeaders.section4LeadingStudents}</h3>
        {this.checkBoxesWithAdditionalTextFieldsFor("currentlyInvolvedInCsEducation", {
          [TextFields.otherPleaseDescribe] : "other"
        })}
        {this.checkBoxesFor("gradesTaught")}
        {this.checkBoxesFor("experienceTeachingThisCourse", {
          label: `Do you have experience teaching the full ${this.program()} curriculum to students? Mark all that apply.`
        })}
        {this.radioButtonsWithAdditionalTextFieldsFor("planOnTeaching", {
          [TextFields.otherWithText] : "other"
        }, {
          label: `Do you plan on teaching ${this.program()} in the 2019-20 school year?`,
        })}
        {this.checkBoxesFor("completedPd", {
          label: `Have you participated as a teacher in Code.org's full Professional Learning Program for ${this.program()}?`
        })}
        {this.checkBoxesWithAdditionalTextFieldsFor("facilitatorAvailability", {
          [TextFields.otherWithText] : "other"
        })}
      </FormGroup>
    );
  }
}
