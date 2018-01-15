import React  from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import {PROGRAM_CSD, PROGRAM_CSP} from "./TeacherApplicationConstants";

export default class Section3ChooseYourProgram extends LabeledFormComponent {
  static labels = PageLabels.section3ChooseYourProgram;

  static associatedFields = [
    ...Object.keys(PageLabels.section3ChooseYourProgram),
    "csdCourseHoursPerWeek_other",
    "planToTeach_dontKnowExplain"
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 3: {SectionHeaders.section3ChooseYourProgram}</h3>

        {this.radioButtonsFor("program")}

        {this.props.data.program === PROGRAM_CSD &&
          <div>
            {this.checkBoxesFor("csdWhichGrades")}

            {this.radioButtonsWithAdditionalTextFieldsFor("csdCourseHoursPerWeek", {
              "Other (Please List):" : "other"
            })}

            {this.radioButtonsFor("csdCourseHoursPerYear")}
            {this.radioButtonsFor("csdTermsPerYear")}
          </div>
        }

        {this.props.data.program === PROGRAM_CSP &&
          <div>
            {this.checkBoxesFor("cspWhichGrades")}
            {this.radioButtonsFor("cspCourseHoursPerWeek")}
            {this.radioButtonsFor("cspCourseHoursPerYear")}
            {this.radioButtonsFor("cspTermsPerYear")}
            {this.radioButtonsFor("cspHowOffer")}
            {this.radioButtonsFor("cspApExam")}
          </div>
        }

        {this.radioButtonsWithAdditionalTextFieldsFor("planToTeach", {
          "I don't know if I will teach this course (Please Explain):" : "dontKnowExplain"
        })}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.program === PROGRAM_CSD) {
      requiredFields.push(
        "csdWhichGrades",
        "csdCourseHoursPerWeek",
        "csdCourseHoursPerYear",
        "csdTermsPerYear",
      );
    }

    if (data.program === PROGRAM_CSP) {
      requiredFields.push(
        "cspWhichGrades",
        "cspCourseHoursPerWeek",
        "cspCourseHoursPerYear",
        "cspTermsPerYear",
        "cspHowOffer",
        "cspApExam"
      );
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.program === PROGRAM_CSD) {
      changes.cspWhichGrades = undefined;
      changes.cspCourseHoursPerWeek = undefined;
      changes.cspCourseHoursPerYear = undefined;
      changes.cspTermsPerYear = undefined;
      changes.cspHowOffer = undefined;
      changes.cspApExam = undefined;
    }

    if (data.program === PROGRAM_CSP) {
      changes.csdWhichGrades = undefined;
      changes.csdCourseHoursPerWeek = undefined;
      changes.csdCourseHoursPerYear = undefined;
      changes.csdTermsPerYear = undefined;
    }

    return changes;
  }
}
