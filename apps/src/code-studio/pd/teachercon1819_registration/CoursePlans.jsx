import React from 'react';

import { FormGroup } from 'react-bootstrap';

import { TextFields } from '@cdo/apps/generated/pd/teachercon1819RegistrationConstants';

import Teachercon1819FormComponent from './Teachercon1819FormComponent';

export default class CoursePlans extends Teachercon1819FormComponent {
  static labels = {
    howOfferCsp: "How do you plan to offer CS Principles?",
    haveTaughtAp: "Have you taught an AP course before?",
    haveTaughtWrittenProjectCourse: "Have you taught any courses that culminate in a large, end-of-year written project?",
    gradingSystem: "What type of grading system does your school use?",

    howManyHours: "Approximately how many course hours per school year will your school offer this course?",
    howManyTerms: "How many terms will this course span in one school year?"
  };

  static associatedFields = Object.keys(CoursePlans.labels);

  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data['course'] === 'CS Principles') {
      requiredFields.push(
        'howOfferCsp',
        'haveTaughtAp',
        'haveTaughtWrittenProjectCourse',
        'howManyHours',
        'howManyTerms',
        'gradingSystem'
      );
    } else if (data['course'] === 'CS Discoveries') {
      requiredFields.push(
        'howManyHours',
        'howManyTerms',
        'gradingSystem'
      );
    }

    return requiredFields;
  }

  render() {
    return (
      <FormGroup>
        <h4>Section 3: Course Plans</h4>

        {this.props.course === "CS Principles" &&
          <FormGroup>
            {this.radioButtonsFor("howOfferCsp")}
            {this.radioButtonsFor("haveTaughtAp")}
            {this.radioButtonsFor("haveTaughtWrittenProjectCourse")}
            {this.radioButtonsFor("howManyHours")}
            {this.radioButtonsFor("howManyTerms")}
            {this.radioButtonsWithAdditionalTextFieldsFor("gradingSystem", {
              [TextFields.otherPleaseList]: "grading_system_other"
            })}
          </FormGroup>
        }

        {this.props.course === "CS Discoveries" &&
          <FormGroup>
            {this.radioButtonsFor("howManyHours")}
            {this.radioButtonsFor("howManyTerms")}
            {this.radioButtonsWithAdditionalTextFieldsFor("gradingSystem", {
              [TextFields.otherPleaseList]: "grading_system_other"
            })}
          </FormGroup>
        }

      </FormGroup>
    );
  }
}

