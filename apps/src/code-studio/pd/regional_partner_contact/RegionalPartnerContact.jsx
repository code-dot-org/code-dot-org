import React from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import {FormGroup, Checkbox} from 'react-bootstrap';

export default class RegionalPartnerContact extends FormController {
  /**
   * @override
   */
  onSuccessfulSubmit(data) {
    window.location = `/pd/regional_partner_contact/${data.id}/thanks`;
  }

  /**
   * @override
   */
  serializeFormData() {
    const formData = super.serializeFormData();
    Object.assign(formData['form_data'], this.getDistrictData());

    return formData;
  }

  getDistrictData() {
    const schoolDistrictData = {};

    schoolDistrictData['school-type'] = document.getElementById('school-type').value;
    schoolDistrictData['school-state'] = document.getElementById('school-state').value;
    schoolDistrictData['school-district'] = document.querySelector('#school-district input').value;
    schoolDistrictData['school-district-other'] = document.getElementById('school-district-other').checked;
    schoolDistrictData['school'] = document.querySelector('#school input').value;
    schoolDistrictData['school-other'] = document.getElementById('school-other').checked;
    schoolDistrictData['school-district-name'] = document.getElementById('school-district-name').value;
    schoolDistrictData['school-name'] = document.getElementById('school-name').value;
    schoolDistrictData['school-zipcode'] = document.getElementById('school-zipcode').value;

    schoolDistrictData['receiveEmails'] = document.getElementById('receiveEmails').checked;

    return schoolDistrictData;
  }
  /**
   * @override
   */
  getPageComponents() {
    return [
      RegionalPartnerContactComponent
    ];
  }
}

class RegionalPartnerContactComponent extends FormComponent {
  render() {
    return (
      <FormGroup>
        {
          this.buildFieldGroup({
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'lastName',
            label: 'Last Name',
            type: 'text',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'title',
            label: 'Title',
            type: 'radio',
            required: false
          })
        }
        {
          this.buildFieldGroup({
            name: 'email',
            label: 'Email',
            type: 'text',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'role',
            label: 'Your role in the school/district',
            type: 'radio',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'jobTitle',
            label: 'Job Title',
            type: 'text',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'gradeLevels',
            label: 'What grade levels are you interested in bringing Computer Science to?',
            type: 'check',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'notes',
            label: 'Notes for your local Regional Partner (ex: why you want to bring CS to your school/district, questions you have, etc.)',
            componentClass: 'textarea'
          })
        }
        <Checkbox
          id="receiveEmails"
          defaultChecked
        >
          I want to be added to the Code.org mailing list.
        </Checkbox>

      </FormGroup>
    );
  }
}

RegionalPartnerContactComponent.associatedFields =
  ['firstName', 'lastName', 'title', 'email', 'role', 'jobTitle', 'gradeLevels', 'notes', 'receiveEmails'];
