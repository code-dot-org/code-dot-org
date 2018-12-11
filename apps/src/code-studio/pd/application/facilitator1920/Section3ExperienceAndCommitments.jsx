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
          program !== CSF &&
          <div>
            {/* CSD/CSP RP based Qs */}
            {/* if no RP */}
            <p>
              <strong>There is no Regional Partner in your region at this time.</strong>
            </p>
            <p>
              Please note that we prioritize applicants in regions where we currently have a Regional
              Partner, and there is a need for additional facilitators. Code.org will review your
              application and contact you if there is a need for facilitators in a nearby region. We are
              not able to guarantee a space for you in a different location.
            </p>
            {this.checkBoxesFor('csdCspNoPartnerSummerWorkshop')}
            {/* if RP */}
            <p>
              <strong>Your Regional Partner is Regional Partner Name.</strong>
            </p>
            {/* if RP and RP has no summer workshops */}
            {this.checkBoxesFor('csdCspPartnerButNoSummerWorkshop')}
            {/* if RP  and RP has workshops */}
            {this.radioButtonsFor('csdCspPartnerWithSummerWorkshop')}
            {this.checkBoxesWithAdditionalTextFieldsFor('csdCspWhichSummerWorkshop', {
              [TextFields.notSurePleaseExplain] : "other",
            })}
            {/* normal q's */}
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

            {this.radioButtonsFor("csdCspLeadSummerWorkshopRequirement")}
            {this.radioButtonsFor("csdCspDeeperLearningRequirement")}
          </div>
        }

        {
          program === CSF &&
          <div>
            {this.radioButtonsFor("csfSummitRequirement")}
            {this.radioButtonsFor("csfWorkshopRequirement")}
            {this.radioButtonsFor("csfCommunityRequirement")}
          </div>
        }

        {this.radioButtonsFor("developmentAndPreparationRequirement")}

        {
          program === CSF &&
          <div>
            <p>
              Code.org facilitators work with their assigned Regional Partner to host workshops
              for teachers in their region. Facilitator applicants are assigned to Regional
              Partners based on the zip code they provide in their application.
            </p>
            {/* CSF RP based Qs */}
            {/* if no RP */}
            <p>
              <strong>There is no Regional Partner supporting CS Fundamentals in your region at this time.</strong>
            </p>
            <p>
              Please note that we prioritize applicants in regions where we currently have a
              Regional Partner supporting CS Fundamentals, and there is a need for additional
              facilitators. Code.org will review your application and contact you if there is
              a need for facilitators. We are not able to guarantee a space for you in a
              different location.
            </p>
            {/* if RP does not support CSF (small mapping) */}
            <p>
              <strong>Your Regional Partner is not accepting applications for CS Fundamentals facilitators at this time.</strong>
            </p>
            <p>
              Please note that we prioritize applicants in regions where we currently have a
              Regional Partner supporting CS Fundamentals, and there is a need for additional
              facilitators. Code.org will review your application and contact you if there is
              a need for facilitators. We are not able to guarantee a space for you in a
              different location.
            </p>
            {/* if RP and not in small mapping*/}
            <p>
              <strong>Your Regional Partner is Regional Partner Name.</strong>
            </p>
            {this.radioButtonsFor('csfGoodStandingRequirement')}
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
