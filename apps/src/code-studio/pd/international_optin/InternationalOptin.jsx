import React, {PropTypes} from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import {FormGroup} from 'react-bootstrap';

export default class InternationalOptin extends FormController {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired
  };

  /**
   * @override
   */
  onSuccessfulSubmit(data) {
    window.location = `/pd/international_optin/${data.id}/thanks`;
  }

  /**
   * @override
   */
  serializeFormData() {
    const formData = super.serializeFormData();
    //Object.assign(formData['form_data'], this.getDistrictData());

    return formData;
  }

  /**
   * @override
   */
  getPageComponents() {
    return [
      InternationalOptinComponent
    ];
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      accountEmail: this.props.accountEmail
    };
  }
}

class InternationalOptinComponent extends FormComponent {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired
  };

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
            name: 'firstNamePreferred',
            label: 'Preferred First Name',
            type: 'text',
            required: false
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
            value: this.props.accountEmail,
            readOnly: true
          })
        }

        {
          this.buildFieldGroup({
            name: 'emailAlternate',
            label: 'Alternate Email',
            type: 'text'
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'gender',
            label: 'Gender Identity',
            type: 'radio',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'schoolName',
            label: 'School Name',
            type: 'text',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'schoolCity',
            label: 'School City',
            type: 'text',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'schoolCountry',
            label: 'School Country',
            type: 'radio',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'ages',
            label: 'Which age(s) do you teach this year?',
            type: 'check',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'subjects',
            label: 'Which subject(s) do you teach this year?',
            type: 'check',
            required: true,
            includeOther: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'resources',
            label: 'Which of the following CS education resources do you use?',
            type: 'check',
            required: false,
            includeOther: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'robotics',
            label: 'Which of the following robotics resources do you use?',
            type: 'check',
            required: false,
            includeOther: true
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopOrganizer',
            label: 'Workshop Organizer',
            required: true
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopFacilitator',
            label: 'Workshop Facilitator',
            required: true
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopCourse',
            label: 'Workshop Course',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'optIn',
            label: 'I want to share my data with Code.org, International Partner',
            type: 'radio',
            required: true
          })
        }
      </FormGroup>
    );
  }
}

InternationalOptinComponent.associatedFields =
  ['firstName', 'lastName', 'title', 'email', 'optIn'];
