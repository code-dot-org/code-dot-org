import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import {CSF, CSD, CSP} from '../ApplicationConstants';
import {ProgramMapping} from './Facilitator1920Application';

export default class Section3ExperienceAndCommitments extends LabeledFormComponent {
  static labels = PageLabels.section3ExperienceAndCommitments;

  static associatedFields = [
    ...Object.keys(PageLabels.section3ExperienceAndCommitments),
  ];

  render() {
    const program = ProgramMapping[this.props.data.program] || 'CS Program';
    return (
      <FormGroup>
        <h3>Section 3: {SectionHeaders.section3ExperienceAndCommitments}</h3>
        {this.radioButtonsFor("teachingExperience")}
        {this.radioButtonsFor("haveLedAdults")}

        <p>
          The Code.org Facilitator Development Program is an intensive, year-long
          commitment that kicks off your time as a Code.org facilitator. The high-level
          program commitments for the first year are listed below. Please indicate
          whether you can reasonably meet these commitments, and note that we expect
          that you would continue facilitating beyond this first year.
        </p>

        {
          program === CSF &&
          <div>
            {this.radioButtonsFor("csfSummitRequirement")}
            {this.radioButtonsFor("csfWorkshopRequirement")}
            {this.radioButtonsFor("csfCommunityRequirement")}
          </div>
        }

        {
          program !== CSF &&
          <div>
            {this.radioButtonsFor("csdCspFitWeekendRequirement")}
            {this.checkBoxesWithAdditionalTextFieldsFor("csdCspWhichFitWeekend", {
              [TextFields.notSurePleaseExplain] : "other",
              [TextFields.unableToAttendPleaseExplain] : "other"
            })}
            {this.radioButtonsFor("csdCspWorkshopRequirement")}

            {
              program === CSD &&
              <div>
                {this.radioButtonsFor("csdTrainingRequirement")}
              </div>
            }

            {
              program === CSP &&
              <div>
                {this.radioButtonsFor("cspTrainingRequirement")}
              </div>
            }

            {this.radioButtonsFor("csdCspSummerWorkshopRequirement")}
            {this.radioButtonsFor("csdCspDeeperLearningRequirement")}
          </div>
        }

        {this.radioButtonsFor("developmentAndPreparationRequirement")}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];
    const program = ProgramMapping[data.program] || 'CS Program';

    if (program === CSF) {
      requiredFields.push(
        "csfSummitRequirement",
        "csfWorkshopRequirement",
        "csfCommunityRequirement"
      );
    }

    if (program !== CSF) {
      requiredFields.push(
        "csdCspFitWeekendRequirement",
        "csdCspWhichFitWeekend",
        "csdCspWorkshopRequirement",
        "csdCspSummerWorkshopRequirement",
        "csdCspDeeperLearningRequirement"
      );
    }

    if (program === CSD) {
      requiredFields.push("csdTrainingRequirement");
    }

    if (program === CSP) {
      requiredFields.push("cspTrainingRequirement");
    }

    return requiredFields;
  }
}
