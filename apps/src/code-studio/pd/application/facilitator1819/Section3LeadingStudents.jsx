import React, {PropTypes} from 'react';
import {FormGroup} from "react-bootstrap";
import Facilitator1819FormComponent from "./Facilitator1819FormComponent";
import {pageLabels} from './Facilitator1819Labels';
import {YES, NONE} from '../ApplicationConstants';

export default class Section3LeadingStudents extends Facilitator1819FormComponent {
  static propTypes = {
    ...Facilitator1819FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = pageLabels.Section3LeadingStudents;

  static associatedFields = [
    ...Object.keys(pageLabels.Section3LeadingStudents),
    "gradesTaught_other",
    "gradesCurrentlyTeaching_other",
    "subjectsTaught_other",
    "experienceLeading_other"
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 3: Leading Students</h3>

        {this.radioButtonsFor("teachingExperience")}

        {this.checkBoxesWithAdditionalTextFieldsFor("ledCsExtracurriculars", {
          "Other (please list):" : "other"
        })}

        {this.props.data.teachingExperience === YES &&
          <div>
            {this.checkBoxesWithAdditionalTextFieldsFor("gradesTaught", {
              "Other:" : "other"
            })}

            {this.checkBoxesWithAdditionalTextFieldsFor("gradesCurrentlyTeaching", {
              "Other:" : "other"
            })}

            {this.checkBoxesWithAdditionalTextFieldsFor("subjectsTaught", {
              "Other:" : "other"
            })}

            {this.radioButtonsFor("yearsExperience")}

            {this.props.data.yearsExperience && this.props.data.yearsExperience !== NONE &&
              <div>
                {this.checkBoxesWithAdditionalTextFieldsFor("experienceLeading", {
                  "Other:" : "other"
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
}
