import React from 'react';

import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';

import UsPhoneNumberInput from "../form_components/UsPhoneNumberInput";
import {isZipCode} from '@cdo/apps/util/formatValidation';

import FormComponent from '../form_components/FormComponent';

export default class TravelPlans extends FormComponent {
  static associatedFields = [
    'contactFirstName',
    'contactLastName',
    'contactRelationship',
    'contactPhone',
    'dietaryNeeds',
    'liveFarAway',
    'addressStreet',
    'addressCity',
    'addressState',
    'addressZip',
    'howTraveling',
    'needHotel',
    'needAda',
  ];

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (data.addressZip && !isZipCode(data.addressZip)) {
      formatErrors.addressZip = "Must be a valid zip code";
    }

    if (!UsPhoneNumberInput.isValid(data.contactPhone)) {
      formatErrors.contactPhone = "Must be a valid phone number including area code";
    }

    return formatErrors;
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];
    if (data.liveFarAway === 'Yes') {
      requiredFields.push(
        "addressStreet",
        "addressCity",
        "addressState",
        "addressZip",
      );
    }

    if (data.needHotel === 'Yes') {
      requiredFields.push("needAda");
    }

    return requiredFields;
  }

  render() {
    return (
      <FormGroup>
        <h4>Section 2: Travel Plans</h4>

        <FormGroup>
          <ControlLabel>
            Please provide the name and phone number of someone we can contact in
            case of an emergency.
          </ControlLabel>
          {this.buildFieldGroup({
            controlWidth: {md: 6},
            label: "First name:",
            name: "contactFirstName",
            required: true,
            type: "text",
          })}
          {this.buildFieldGroup({
            controlWidth: {md: 6},
            label: "Last name:",
            name: "contactLastName",
            required: true,
            type: "text",
          })}
          {this.buildFieldGroup({
            controlWidth: {md: 6},
            label: "Relationship to you:",
            name: "contactRelationship",
            required: true,
            type: "text",
          })}
          {this.buildUsPhoneNumberInput({
            controlWidth: {md: 6},
            label: "Phone number:",
            name: "contactPhone",
            placeholder: "XXX-XXX-XXXX",
            required: true,
            type: "tel",
          })}
        </FormGroup>

        <FormGroup>
          {this.buildButtonsWithAdditionalTextFieldsFromOptions({
            name: 'dietaryNeeds',
            label: "Do you have any dietary needs or food allergies?",
            type: 'check',
            required: true,
            textFieldMap: {
              "Food Allergy": "food_allergy_details"
            }
          })}
        </FormGroup>

        <FormGroup>
          {this.buildButtonsFromOptions({
            name: 'liveFarAway',
            label: `Do you live more than 25 miles from downtown ${this.props.teacherconLocation}?`,
            type: 'radio'
          })}
          {
            this.props.data.liveFarAway &&
              this.props.data.liveFarAway === 'Yes' &&
              <FormGroup>
                <ControlLabel>
                  Please provide your home address
                </ControlLabel>
                {this.buildFieldGroup({
                  controlWidth: {md: 6},
                  label: "Street",
                  name: "addressStreet",
                  required: true,
                  type: "text",
                })}
                {this.buildFieldGroup({
                  controlWidth: {md: 6},
                  label: "City",
                  name: "addressCity",
                  required: true,
                  type: "text",
                })}
                {this.buildSelectFieldGroupFromOptions({
                  controlWidth: {md: 6},
                  label: "State",
                  name: "addressState",
                  placeholder: "-",
                  required: true,
                })}
                {this.buildFieldGroup({
                  controlWidth: {md: 6},
                  label: "Zip",
                  name: "addressZip",
                  required: true,
                  type: "text",
                })}
              </FormGroup>
          }
        </FormGroup>

        <FormGroup>
          {this.buildButtonsFromOptions({
            label: "Code.org provides a round trip flight for every TeacherCon attendee. If you choose to fly, we will provide you with detailed flight booking instructions approximately six weeks prior to TeacherCon. If you choose not to fly, and live at least 25 miles from the TeacherCon location, Code.org will provide you with a $150 gift card to help cover the cost of driving, trains, or public transit. Code.org is not able to provide reimbursement for the cost of driving, trainings, or public transit if you live less than 25 miles from the TeacherCon location. How will you travel to TeacherCon?",
            name: 'howTraveling',
            required: true,
            type: 'radio',
          })}
          {this.buildButtonsFromOptions({
            label: "Code.org provides a hotel room for every TeacherCon attendee. Attendees will not be required to share a room. Would you like a hotel room at TeacherCon?",
            name: 'needHotel',
            required: true,
            type: 'radio',
          })}
          {
            this.props.data.needHotel &&
              this.props.data.needHotel === 'Yes' &&
              this.buildButtonsWithAdditionalTextFieldsFromOptions({
                label: "Do you require an ADA accessible hotel room?",
                name: 'needAda',
                required: true,
                type: 'radio',
                textFieldMap: {
                  "Other (please explain):": "ada_details"
                }
              })
          }
        </FormGroup>
      </FormGroup>
    );
  }
}

