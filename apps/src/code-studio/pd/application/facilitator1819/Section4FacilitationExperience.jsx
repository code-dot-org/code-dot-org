import React, {PropTypes} from 'react';
import {FormGroup} from "react-bootstrap";
import Facilitator1819FormComponent from "./Facilitator1819FormComponent";
import {pageLabels} from './Facilitator1819Labels';
import {YES} from '../ApplicationConstants';

export default class Section4FacilitationExperience extends Facilitator1819FormComponent {
  static propTypes = {
    ...Facilitator1819FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = pageLabels.Section4FacilitationExperience;

  static associatedFields = [
    ...Object.keys(pageLabels.Section4FacilitationExperience)
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 4: Facilitation Experience</h3>

        {this.radioButtonsFor("codeOrgFacilitator")}

        {this.props.data.codeOrgFacilitator === YES &&
        <div>
          {this.checkBoxesFor("codeOrgFacilitatorYears")}
          {this.checkBoxesFor("codeOrgFacilitatorPrograms")}
        </div>
        }

        {this.checkBoxesFor("groupsLedPd")}
        {this.largeInputFor("describePriorPd")}
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
}
