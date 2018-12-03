import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import {YES} from '../ApplicationConstants';

export default class Section4LeadingStudents extends LabeledFormComponent {
  static labels = PageLabels.Section4LeadingStudents;

  static associatedFields = [
    ...Object.keys(PageLabels.Section4LeadingStudents)
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 4: {SectionHeaders.Section4LeadingStudents}</h3>

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

    if (data.haveLedPd !== YES) {
      changes.groupsLedPd = undefined;
      changes.describePriorPd = undefined;
    }

    return changes;
  }
}
