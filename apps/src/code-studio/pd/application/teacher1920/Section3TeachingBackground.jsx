import React from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {FormGroup} from 'react-bootstrap';

export default class Section3TeachingBackground extends LabeledFormComponent {
  static labels = PageLabels.section3TeachingBackground;

  static associatedFields = [
    ...Object.keys(PageLabels.section3TeachingBackground),
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 3: {SectionHeaders.section3TeachingBackground}</h3>
        {this.checkBoxesWithAdditionalTextFieldsFor('subjectsTeaching', {
          [TextFields.otherPleaseList]: "other"
        })}
        <p>
          Requirements for licensing, certifications, and endorsements to teach computer
          science vary widely across the country. Please answer the following questions to
          the best of your knowledge, so that your Regional Partner can ensure that
          teachers selected for this program will be able to teach the course in the
          coming school year.
        </p>
        <p>
          Note: Code.org does not require specific licenses to teach these courses, but to
          participate in this program, you should be planning to teach this course during
          the 2019-20 school year.
        </p>
        {this.radioButtonsFor('doesSchoolRequireCsLicense')}
        {this.props.data.doesSchoolRequireCsLicense === 'Yes' && this.largeInputFor('whatLicenseRequired')}
        {this.radioButtonsFor('haveCsLicense')}
        {this.checkBoxesWithAdditionalTextFieldsFor('subjectsLicensedToTeach', {
          [TextFields.otherPleaseList]: "other"
        })}
        {this.checkBoxesWithAdditionalTextFieldsFor('taughtInPast', {
          [TextFields.otherPleaseList]: "other"
        })}
        {this.checkBoxesFor('previousYearlongCdoPd')}
        {this.checkBoxesWithAdditionalTextFieldsFor('csOfferedAtSchool', {
          [TextFields.otherPleaseList]: "other"
        })}
      </FormGroup>
    );
  }


  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.doesSchoolRequireCsLicense === 'Yes') {
      requiredFields.push('whatLicenseRequired');
    }
    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.doesSchoolRequireCsLicense !== 'Yes') {
      changes.whatLicenseRequired = undefined;
    }

    return changes;
  }
}
