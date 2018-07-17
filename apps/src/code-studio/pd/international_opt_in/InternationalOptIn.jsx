import React, {PropTypes} from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import DatePicker from '../workshop_dashboard/components/date_picker';
import moment from 'moment';
import {DATE_FORMAT} from '../workshop_dashboard/workshopConstants';
import {
  Row,
  Col,
  ControlLabel,
  FormGroup
} from 'react-bootstrap';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class InternationalOptIn extends FormController {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired
  };

  /**
   * @override
   */
  onSuccessfulSubmit(data) {
    window.location = `/pd/international_workshop/${data.id}/thanks`;
  }

  /**
   * @override
   */
  serializeFormData() {
    const formData = super.serializeFormData();
    formData.form_data.email = this.props.accountEmail;
    return formData;
  }

  /**
   * @override
   */
  getPageComponents() {
    return [
      InternationalOptInComponent
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


class InternationalOptInComponent extends FormComponent {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired
  };

  handleDateChange = (date) => {
    // Don't allow null. If the date is cleared, default again to today.
    date = date || moment();
    super.handleChange({date: date.format(DATE_FORMAT)});
  };

  render() {
    const labels = this.props.labels;
    const date = (this.props.data && this.props.data.date) ?
      moment(this.props.data.date, DATE_FORMAT) : moment();

    const lastSubjectsKey = this.props.options.subjects.slice(-1)[0];
    const textFieldMapSubjects = {[lastSubjectsKey]: "other"};

    const lastResourcesKey = this.props.options.resources.slice(-1)[0];
    const textFieldMapResources = {[lastResourcesKey]: "other"};

    const lastRoboticsKey = this.props.options.robotics.slice(-1)[0];
    const textFieldMapRobotics = {[lastRoboticsKey]: "other"};

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
          this.buildButtonsWithAdditionalTextFieldsFromOptions({
            name: 'subjects',
            label: labels.subjects,
            type: 'check',
            required: true,
            textFieldMap: textFieldMapSubjects
          })
        }
        {
          this.buildButtonsWithAdditionalTextFieldsFromOptions({
            name: 'resources',
            label: labels.resources,
            type: 'check',
            required: false,
            textFieldMap: textFieldMapResources
          })
        }
        {
          this.buildButtonsWithAdditionalTextFieldsFromOptions({
            name: 'robotics',
            label: labels.robotics,
            type: 'check',
            required: false,
            textFieldMap: textFieldMapRobotics
          })
        }

        <FormGroup
          id="date"
          controlId="date"
          validationState={this.getValidationState("date")}
        >
          <Row>
            <Col md={6}>
              <ControlLabel>
                {i18n.workshopDate()}
                <span style={{color: 'red'}}> *</span>
              </ControlLabel>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <DatePicker
                date={date}
                onChange={this.handleDateChange}
                readOnly={false}
              />
            </Col>
          </Row>
        </FormGroup>
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopOrganizer',
            label: labels.workshopOrganizer,
            required: true,
            placeholder: i18n.selectAnOption()
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopFacilitator',
            label: labels.workshopFacilitator,
            required: true,
            placeholder: i18n.selectAnOption()
          })
        }
        {
          this.buildSelectFieldGroupFromOptions({
            name: 'workshopCourse',
            label: labels.workshopCourse,
            required: true,
            placeholder: i18n.selectAnOption()
          })
        }
        {
          this.buildButtonsFromOptions({
            name: 'emailOptIn',
            label:
              <span>
                {labels.emailOptIn}
                &nbsp;
                <a href={pegasus('/privacy')}>
                  {i18n.seePrivacyPolicy()}
                </a>
              </span>,
            type: 'radio',
            required: true,
            placeholder: i18n.selectAnOption()
          })
        }
        {
          this.buildSingleCheckbox({
            name: 'legalOptIn',
            label: labels.legalOptIn,
            required: true
          })
        }
      </FormGroup>
    );
  }
}

InternationalOptInComponent.associatedFields = [
  'firstName', 'firstNamePreferred', 'lastName', 'email', 'emailAlternate', 'gender',
  'schoolName', 'schoolCity', 'schoolCountry', 'ages', 'subjects', 'resources',
  'robotics', 'workshopOrganizer', 'workshopFacilitator', 'workshopCourse',
  'emailOptIn', 'legalOptIn'
];
