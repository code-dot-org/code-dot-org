import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import {YES} from '../ApplicationConstants';

export default class Section2ChooseYourProgram extends LabeledFormComponent {
  static labels = PageLabels.section2ChooseYourProgram;

  static associatedFields = [...Object.keys(PageLabels.section2ChooseYourProgram)];

  render() {
    return (
      <FormGroup>
        <h3>Section 2: {SectionHeaders.section2ChooseYourProgram}</h3>
        <p>
          We offer our Facilitator Development Program for three Code.org courses.
          For more details about the requirements to facilitate each program, please visit the{' '}
          <a href="https://code.org/files/facilitator/overview-2019-20.pdf" target="_blank">
            2019-20 Facilitator Development Program Description
          </a>
          .
        </p>

        {this.radioButtonsFor("program")}

        {this.radioButtonsFor("codeOrgFacilitator")}

        {this.props.data.codeOrgFacilitator === YES &&
          <div>
            {this.checkBoxesWithAdditionalTextFieldsFor("codeOrgFacilitatorYears", {
              [TextFields.otherWithText] : "other"
            })}
            {this.checkBoxesWithAdditionalTextFieldsFor("codeOrgFacilitatorPrograms", {
              [TextFields.otherWithText] : "other"
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

    if (data.codeOrgFacilitator === YES) {
      requiredFields.push(
        "codeOrgFacilitatorYears",
        "codeOrgFacilitatorPrograms"
      );
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.codeOrgFacilitator !== YES) {
      changes.codeOrgFacilitatorYears = undefined;
      changes.codeOrgFacilitatorPrograms = undefined;
    }

    return changes;
  }
}
