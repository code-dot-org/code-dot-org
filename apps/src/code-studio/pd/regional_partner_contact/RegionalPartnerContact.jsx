import React from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import {FormGroup} from 'react-bootstrap';

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
            required: false
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
            label: 'Questions or notes for your local Regional Partner',
            componentClass: 'textarea',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'optIn',
            label: (
              <div style={{display: 'inline-block'}}>
                Can we email you about updates to Code.org courses, local opportunities, or other computer science news?
                &nbsp;
                <a
                  href={`${window.dashboard.CODE_ORG_URL}/privacy`}
                  target="_blank"
                >
                  (See our privacy policy)
                </a>
              </div>
            ),
            type: 'radio',
            required: true
          })
        }
      </FormGroup>
    );
  }
}

RegionalPartnerContactComponent.associatedFields =
  ['firstName', 'lastName', 'email', 'role', 'jobTitle', 'gradeLevels', 'notes', 'optIn'];
