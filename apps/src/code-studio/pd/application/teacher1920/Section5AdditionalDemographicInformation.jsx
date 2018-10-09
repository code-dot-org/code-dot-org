import React from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {FormGroup} from 'react-bootstrap';

export default class Section5AdditionalDemographicInformation extends LabeledFormComponent {
  static labels = PageLabels.section5AdditionalDemographicInformation;

  static associatedFields = [
    ...Object.keys(PageLabels.section5AdditionalDemographicInformation)
  ];

  render() {
    return (
      <FormGroup>
        <h3>
          Section 5: {SectionHeaders.section5AdditionalDemographicInformation}
        </h3>
        {this.radioButtonsFor('genderIdentity')}
        {this.checkBoxesFor('race')}
        {this.checkBoxesWithAdditionalTextFieldsFor('howHeard', {
          [TextFields.otherWithText]: "other"
        }, {
          required: false
        })}
      </FormGroup>
    );
  }
}
