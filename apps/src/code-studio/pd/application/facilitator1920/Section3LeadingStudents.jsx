import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import {YES, NONE} from '../ApplicationConstants';

export default class Section3LeadingStudents extends LabeledFormComponent {
  static labels = PageLabels.section3LeadingStudents;

  static associatedFields = [
    ...Object.keys(PageLabels.section3LeadingStudents),
    "gradesTaught_other",
    "gradesCurrentlyTeaching_other",
    "subjectsTaught_other",
    "experienceLeading_other"
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 3: {SectionHeaders.section3LeadingStudents}</h3>

        {this.radioButtonsFor("teachingExperience")}

        {this.checkBoxesWithAdditionalTextFieldsFor("ledCsExtracurriculars", {
          [TextFields.otherPleaseList] : "other"
        })}

        {this.props.data.teachingExperience === YES &&
          <div>
            {this.checkBoxesWithAdditionalTextFieldsFor("gradesTaught", {
              [TextFields.otherWithText] : "other"
            })}

            {this.checkBoxesWithAdditionalTextFieldsFor("gradesCurrentlyTeaching", {
              [TextFields.otherWithText] : "other"
            })}

            {this.checkBoxesWithAdditionalTextFieldsFor("subjectsTaught", {
              [TextFields.otherWithText] : "other"
            })}

            {this.radioButtonsFor("yearsExperience")}

            {this.props.data.yearsExperience && this.props.data.yearsExperience !== NONE &&
              <div>
                {this.checkBoxesWithAdditionalTextFieldsFor("experienceLeading", {
                  [TextFields.otherWithText] : "other"
                })}

                {this.checkBoxesFor("completedPd")}
              </div>
            }
          </div>
        }
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.teachingExperience === YES) {
      requiredFields.push(
        "gradesTaught",
        "gradesCurrentlyTeaching",
        "subjectsTaught",
        "yearsExperience"
      );
    }

    if (data.yearsExperience && data.yearsExperience !== NONE) {
      requiredFields.push(
        "experienceLeading",
        "completedPd"
      );
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.teachingExperience !== YES) {
      changes.gradesTaught = undefined;
      changes.gradesCurrentlyTeaching = undefined;
      changes.subjectsTaught = undefined;
      changes.yearsExperience = undefined;
    }

    if (!data.yearsExperience || data.yearsExperience === NONE) {
      changes.experienceLeading = undefined;
      changes.completedPd = undefined;
    }

    return changes;
  }
}
