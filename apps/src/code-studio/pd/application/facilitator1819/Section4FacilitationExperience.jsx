import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/facilitator1819ApplicationConstants';
import {YES} from '../ApplicationConstants';

export default class Section4FacilitationExperience extends LabeledFormComponent {
  static labels = PageLabels.section4FacilitationExperience;

  static associatedFields = [
    ...Object.keys(PageLabels.section4FacilitationExperience)
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 4: {SectionHeaders.section4FacilitationExperience}</h3>

        {this.radioButtonsFor("codeOrgFacilitator")}

        {this.props.data.codeOrgFacilitator === YES &&
          <div>
            {this.checkBoxesFor("codeOrgFacilitatorYears")}
            {this.checkBoxesFor("codeOrgFacilitatorPrograms")}
          </div>
        }

        {this.radioButtonsFor("haveLedPd")}

        {this.props.data.haveLedPd === YES &&
          <div>
            {this.checkBoxesFor("groupsLedPd")}
            {this.largeInputFor("describePriorPd")}
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

    if (data.haveLedPd === YES) {
      requiredFields.push(
        "groupsLedPd",
        "describePriorPd"
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

    if (data.haveLedPd !== YES) {
      changes.groupsLedPd = undefined;
      changes.describePriorPd = undefined;
    }

    return changes;
  }
}
