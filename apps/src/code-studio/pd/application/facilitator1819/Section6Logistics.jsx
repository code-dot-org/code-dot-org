import React, {PropTypes} from 'react';
import {FormGroup} from "react-bootstrap";
import Facilitator1819FormComponent from "./Facilitator1819FormComponent";
import {pageLabels} from './Facilitator1819Labels';
import {YES} from '../ApplicationConstants';

export default class Section6Logistics extends Facilitator1819FormComponent {
  static propTypes = {
    ...Facilitator1819FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = pageLabels.Section6Logistics;

  static associatedFields = [
    ...Object.keys(pageLabels.Section6Logistics)
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 6: Logistics</h3>

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
}
