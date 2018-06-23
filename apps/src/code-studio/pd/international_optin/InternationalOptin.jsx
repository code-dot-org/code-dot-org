import React, {PropTypes} from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import {FormGroup} from 'react-bootstrap';

export default class InternationalOptin extends FormController {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired
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
      accountEmail: this.props.accountEmail,
      labels: this.props.labels
    };
  }
}

class InternationalOptinComponent extends FormComponent {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired
  };

  render() {
    const labels = this.props.labels;

    return (
      <FormGroup>
        {
          this.buildFieldGroup({
            name: 'firstName',
            label: labels.firstName,
            type: 'text',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'firstNamePreferred',
            label: labels.firstNamePreferred,
            type: 'text',
            required: false
          })
        }
        {
          this.buildFieldGroup({
            name: 'lastName',
            label: labels.lastName,
            type: 'text',
            required: true
          })
        }

        {
          this.buildFieldGroup({
            name: 'email',
            label: labels.email,
            type: 'text',
            value: this.props.accountEmail,
            readOnly: true
          })
        }

        {
          this.buildFieldGroup({
            name: 'emailAlternate',
            label: labels.emailAlternate,
            type: 'text'
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'gender',
            label: labels.gender,
            type: 'radio',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'schoolName',
            label: labels.schoolName,
            type: 'text',
            required: true
          })
        }
        {
          this.buildFieldGroup({
            name: 'schoolCity',
            label: labels.schoolCity,
            type: 'text',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'schoolCountry',
            label: labels.schoolCountry,
            type: 'radio',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'ages',
            label: labels.ages,
            type: 'check',
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'subjects',
            label: labels.subjects,
            type: 'check',
            required: true,
            includeOther: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'resources',
            label: labels.resources,
            type: 'check',
            required: false,
            includeOther: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'robotics',
            label: labels.robotics,
            type: 'check',
            required: false,
            includeOther: true
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopOrganizer',
            label: labels.workshopOrganizer,
            required: true
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopFacilitator',
            label: labels.workshopFacilitator,
            required: true
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopCourse',
            label: labels.workshopCourse,
            required: true
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'optIn',
            label: labels.optIn,
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
