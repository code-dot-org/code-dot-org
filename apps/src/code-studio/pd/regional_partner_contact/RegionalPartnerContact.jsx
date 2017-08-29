import React from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import {FormGroup} from 'react-bootstrap';
import $ from 'jquery';

export default class RegionalPartnerContact extends FormController {
  /**
   * @override
   */
  serializeFormData() {
    const schoolDistrictData = {
      'us-or-international': document.getElementById('us-or-international').value,
      'school-type': document.getElementById('school-type').value,
      'school-state': document.getElementById('school-state').value,
      'school-district': document.querySelector('#school-district input').value,
      'school-district-other': document.getElementById('school-district-other').checked,
      'school': document.querySelector('#school input').value,
      'school-other': document.getElementById('school-other').checked,
      'school-district-name': document.getElementById('school-district-name').value,
      'school-name': document.getElementById('school-name').value,
      'school-zipcode': document.getElementById('school-zipcode').value
    };

    const dataWithDistrict = Object.assign({}, this.state.data, schoolDistrictData);
    this.setState({
      data: dataWithDistrict
    });

    super.serializeFormData();
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
            label: 'Notes for your local regional partner (ex: why you want to bring CS to your school/district, questions you have, etc.)',
            componentClass: 'textarea'
          })
        }
      </FormGroup>
    );
  }
}
