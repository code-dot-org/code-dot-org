import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitator1819ApplicationConstants';

const PROGRAM_CSF = "CS Fundamentals (Pre-K - 5th grade)";
const CSF_AVAILABILITY_ONLY_WEEKEND = "I will only be able to attend Saturday and Sunday of the training";

export default class Section2ChooseYourProgram extends LabeledFormComponent {
  static labels = PageLabels.section2ChooseYourProgram;

  static associatedFields = [
    ...Object.keys(PageLabels.section2ChooseYourProgram),
    "csdCspTeacherconAvailability_unavailableReason",
    "csdCspFitAvailability_unavailableReason"
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 2: {SectionHeaders.section2ChooseYourProgram}</h3>

        {this.radioButtonsFor("program")}

        {this.radioButtonsWithAdditionalTextFieldsFor("planOnTeaching", {
          [TextFields.otherWithText]: "other"
        })}

        {this.radioButtonsFor("abilityToMeetRequirements")}

        <br/>
        {this.props.data.program === PROGRAM_CSF &&
          <div>
            <h4>
              If selected for the program, you will be required to attend a
              Facilitator-in-Training Weekend in the spring of 2018.
            </h4>

            {this.radioButtonsFor("csfAvailability")}

            {this.props.data.csfAvailability === CSF_AVAILABILITY_ONLY_WEEKEND &&
              this.inputFor("csfPartialAttendanceReason", this.indented())
            }
          </div>
        }

        {this.props.data.program && this.props.data.program !== PROGRAM_CSF &&
          <div>
            <h4>
              If selected for the program, you will be required to attend TeacherCon and a
              Facilitator-in-Training Weekend in the summer of 2018.
            </h4>

            {this.checkBoxesWithAdditionalTextFieldsFor("csdCspTeacherconAvailability", {
              [TextFields.notAvailableForTeachercon] : "unavailableReason"
            })}

            {this.checkBoxesWithAdditionalTextFieldsFor("csdCspFitAvailability", {
              [TextFields.notAvailableForFitWeekend] : "unavailableReason"
            })}
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

    if (data.program === PROGRAM_CSF) {
      requiredFields.push("csfAvailability");

      if (data.csfAvailability === CSF_AVAILABILITY_ONLY_WEEKEND) {
        requiredFields.push("csfPartialAttendanceReason");
      }
    }

    if (data.program && data.program !== PROGRAM_CSF) {
      requiredFields.push(
        "csdCspTeacherconAvailability",
        "csdCspFitAvailability"
      );
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.program !== PROGRAM_CSF) {
      changes.csfAvailability = undefined;

      if (data.csfAvailability !== CSF_AVAILABILITY_ONLY_WEEKEND) {
        changes.csfPartialAttendanceReason = undefined;
      }
    }

    if (!data.program || data.program === PROGRAM_CSF) {
      changes.csdCspTeacherconAvailability = undefined;
      changes.csdCspFitAvailability = undefined;
    }

    return changes;
  }
}
