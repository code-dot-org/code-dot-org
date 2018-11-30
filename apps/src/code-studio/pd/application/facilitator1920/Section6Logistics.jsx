import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import {YES} from '../ApplicationConstants';

export default class Section6Logistics extends LabeledFormComponent {
  static labels = PageLabels.section6Logistics;

  static associatedFields = [
    ...Object.keys(PageLabels.section6Logistics)
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 6: {SectionHeaders.section6Logistics}</h3>

        {this.radioButtonsFor("availableDuringWeek")}

        {this.props.data.availableDuringWeek === YES &&
          this.checkBoxesFor("weeklyAvailability", this.indented())
        }

        {this.radioButtonsFor("travelDistance")}

      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.availableDuringWeek === YES) {
      requiredFields.push("weeklyAvailability");
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.availableDuringWeek !== YES) {
      changes.weeklyAvailability = undefined;
    }

    return changes;
  }
}
