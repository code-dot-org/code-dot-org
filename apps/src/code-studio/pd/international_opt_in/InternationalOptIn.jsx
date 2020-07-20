import PropTypes from 'prop-types';
import React from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import formComponentUtils from '../form_components/utils';
import DatePicker from '../workshop_dashboard/components/date_picker';
import moment from 'moment';
import {DATE_FORMAT} from '../workshop_dashboard/workshopConstants';
import {Row, Col, ControlLabel, FormGroup} from 'react-bootstrap';
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
    return [InternationalOptInComponent];
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

  /**
   * @override
   */
  handleChange(newState) {
    newState = this.handleSchoolDataChange(newState);
    super.handleChange(newState);
  }

  /**
   * We have some special logic in place specifically for Colombia, so define a
   * helper here to let us easily detect if we're in a state where that logic
   * should be applied.
   *
   * @returns {boolean}
   */
  isColombiaSelected() {
    return this.props.data && this.props.data.schoolCountry === 'colombia';
  }

  /**
   * If Colombia is selected as the school's country, we use a hierarchy of
   * select elements to carefully control the school selection (rather than the
   * freeform text inputs we use for other countries). In this scenario, we
   * want to make sure that changing the selection at any point in the
   * hierarchy will clear any previous selections made at dependent points in
   * the hierarchy.
   *
   * @param {Object} newState
   * @returns {Object} - modified state
   */
  handleSchoolDataChange(newState) {
    if (!this.isColombiaSelected()) {
      return newState;
    }

    // Clear out dependent selections. Note that the order here is important to
    // allow the change to propagate all the way down.
    if ('schoolCountry' in newState) {
      // school country changed, clearing department
      newState.schoolDepartment = undefined;
    }
    if ('schoolDepartment' in newState) {
      // school department changed, clearing municipality
      newState.schoolMunicipality = undefined;
    }
    if ('schoolMunicipality' in newState) {
      // school municipality changed, clearing city
      newState.schoolCity = undefined;
    }
    if ('schoolCity' in newState) {
      // school city changed, clearing name
      newState.schoolName = undefined;
    }

    return newState;
  }

  /** @param {moment.Moment} date */
  handleDateChange = date => {
    if (date && date.isValid()) {
      super.handleChange({date: date.format(DATE_FORMAT)});
    } else {
      super.handleChange({date: null});
    }
  };

  handleDateBlur = event => {
    this.handleDateChange(dateStringToMoment(event.target.value));
  };

  /**
   * If they've seleced Colombia as their country, we want to display dropdowns
   * for city and name. We do this because Colombia's system for identifying
   * schools doesn't map perfectly onto "city" and "name", so we present a more
   * controlled interface to hopefully minimize confusion.
   *
   * @returns {Component}
   */
  renderColombianSchoolDataFieldGroup() {
    const selectedDepartment =
      this.props.data && this.props.data.schoolDepartment;
    const selectedMunicipality =
      selectedDepartment &&
      this.props.data &&
      this.props.data.schoolMunicipality;
    const selectedCity =
      selectedMunicipality && this.props.data && this.props.data.schoolCity;

    const departments = this.props.options.colombianSchoolData;
    const selectDepartment = this.buildSelectFieldGroup({
      name: 'schoolDepartment',
      label: this.props.labels.colombianSchoolDepartment,
      options: Object.keys(departments),
      placeholder: i18n.selectAnOption(),
      required: true
    });

    const municipalities = departments[selectedDepartment] || {};
    const selectMunicipality = this.buildSelectFieldGroup({
      name: 'schoolMunicipality',
      label: this.props.labels.colombianSchoolMunicipality,
      options: Object.keys(municipalities),
      disabled: !selectedDepartment,
      placeholder: selectedDepartment
        ? i18n.selectAnOption()
        : i18n.selectDepartmentFirst(),
      required: true
    });

    const cities = municipalities[selectedMunicipality] || {};
    const selectCity = this.buildSelectFieldGroup({
      name: 'schoolCity',
      label: this.props.labels.colombianSchoolCity,
      options: Object.keys(cities),
      disabled: !selectedMunicipality,
      placeholder: selectedMunicipality
        ? i18n.selectAnOption()
        : i18n.selectMunicipalityFirst(),
      required: true
    });

    const names = cities[selectedCity] || [];
    const selectName = this.buildSelectFieldGroup({
      name: 'schoolName',
      label: this.props.labels.colombianSchoolName,
      options: names,
      disabled: !selectedCity,
      placeholder: selectedCity
        ? i18n.selectAnOption()
        : i18n.selectCityFirst(),
      required: true
    });

    return (
      <FormGroup>
        {selectDepartment}
        {selectMunicipality}
        {selectCity}
        {selectName}
      </FormGroup>
    );
  }

  renderSchoolFieldGroups() {
    let schoolDataFieldGroup;

    if (this.isColombiaSelected()) {
      schoolDataFieldGroup = this.renderColombianSchoolDataFieldGroup();
    } else {
      // If no country has been selected, display the inputs disabled with a
      // placeholder text asking the user to select their country first.
      // Otherwise, if they've selected a non-Colombian country, just render
      // the inputs normally.
      const selectedCountry = this.props.data && this.props.data.schoolCountry;
      const placeholder = selectedCountry
        ? undefined
        : i18n.selectCountryFirst();
      schoolDataFieldGroup = (
        <FormGroup>
          {this.buildFieldGroup({
            name: 'schoolCity',
            label: this.props.labels.schoolCity,
            type: 'text',
            disabled: !selectedCountry,
            placeholder,
            required: true
          })}
          {this.buildFieldGroup({
            name: 'schoolName',
            label: this.props.labels.schoolName,
            type: 'text',
            disabled: !selectedCountry,
            placeholder,
            required: true
          })}
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        {this.buildSelectFieldGroupFromOptions({
          name: 'schoolCountry',
          label: this.props.labels.schoolCountry,
          required: true,
          placeholder: i18n.selectAnOption()
        })}
        {schoolDataFieldGroup}
      </FormGroup>
    );
  }

  render() {
    const labels = this.props.labels;

    const lastSubjectsKey = formComponentUtils.normalizeAnswer(
      this.props.options.subjects[this.props.options.subjects.length - 1]
    ).answerValue;
    const textFieldMapSubjects = {[lastSubjectsKey]: 'other'};

    const lastResourcesKey = formComponentUtils.normalizeAnswer(
      this.props.options.resources[this.props.options.resources.length - 1]
    ).answerValue;
    const textFieldMapResources = {[lastResourcesKey]: 'other'};

    const lastRoboticsKey = formComponentUtils.normalizeAnswer(
      this.props.options.robotics[this.props.options.robotics.length - 1]
    ).answerValue;
    const textFieldMapRobotics = {[lastRoboticsKey]: 'other'};

    return (
      <FormGroup>
        {/* Personal */}
        {this.buildFieldGroup({
          name: 'firstName',
          label: labels.firstName,
          type: 'text',
          required: true
        })}
        {this.buildFieldGroup({
          name: 'firstNamePreferred',
          label: labels.firstNamePreferred,
          type: 'text',
          required: false
        })}
        {this.buildFieldGroup({
          name: 'lastName',
          label: labels.lastName,
          type: 'text',
          required: true
        })}
        {this.buildFieldGroup({
          name: 'email',
          label: labels.email,
          type: 'text',
          value: this.props.accountEmail,
          readOnly: true
        })}
        {this.buildFieldGroup({
          name: 'emailAlternate',
          label: labels.emailAlternate,
          type: 'text'
        })}
        {this.buildButtonsFromOptions({
          name: 'gender',
          label: labels.gender,
          type: 'radio',
          required: true
        })}

        {/* School */}
        {this.renderSchoolFieldGroups()}

        {/* Teaching */}
        {this.buildButtonsFromOptions({
          name: 'ages',
          label: labels.ages,
          type: 'check',
          required: true
        })}
        {this.buildButtonsWithAdditionalTextFieldsFromOptions({
          name: 'subjects',
          label: labels.subjects,
          type: 'check',
          required: true,
          textFieldMap: textFieldMapSubjects
        })}
        {this.buildButtonsWithAdditionalTextFieldsFromOptions({
          name: 'resources',
          label: labels.resources,
          type: 'check',
          required: false,
          textFieldMap: textFieldMapResources
        })}
        {this.buildButtonsWithAdditionalTextFieldsFromOptions({
          name: 'robotics',
          label: labels.robotics,
          type: 'check',
          required: false,
          textFieldMap: textFieldMapRobotics
        })}

        {/* Workshop */}
        <FormGroup
          id="date"
          controlId="date"
          validationState={this.getValidationState('date')}
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
                date={dateStringToMoment(
                  this.props.data && this.props.data.date
                )}
                onChange={this.handleDateChange}
                onBlur={this.handleDateBlur}
                readOnly={false}
              />
            </Col>
          </Row>
        </FormGroup>
        {this.buildSelectFieldGroupFromOptions({
          name: 'workshopOrganizer',
          label: labels.workshopOrganizer,
          required: true,
          placeholder: i18n.selectAnOption()
        })}
        {this.buildSelectFieldGroupFromOptions({
          name: 'workshopFacilitator',
          label: labels.workshopFacilitator,
          required: true,
          placeholder: i18n.selectAnOption()
        })}
        {this.buildSelectFieldGroupFromOptions({
          name: 'workshopCourse',
          label: labels.workshopCourse,
          required: true,
          placeholder: i18n.selectAnOption()
        })}

        {/* Opt-Ins */}
        {this.buildButtonsFromOptions({
          name: 'emailOptIn',
          label: (
            <span>
              {labels.emailOptIn}
              &nbsp;
              <a href={pegasus('/privacy')}>{i18n.seePrivacyPolicy()}</a>
            </span>
          ),
          type: 'radio',
          required: true,
          placeholder: i18n.selectAnOption()
        })}
        {this.buildSingleCheckbox({
          name: 'legalOptIn',
          label: labels.legalOptIn,
          required: true
        })}
      </FormGroup>
    );
  }
}

function dateStringToMoment(dateString) {
  const date = dateString && moment(dateString, DATE_FORMAT);
  if (date && date.isValid()) {
    return date;
  }
  return null;
}

InternationalOptInComponent.associatedFields = [
  'firstName',
  'firstNamePreferred',
  'lastName',
  'email',
  'emailAlternate',
  'gender',
  'schoolName',
  'schoolCity',
  'schoolCountry',
  'ages',
  'subjects',
  'resources',
  'robotics',
  'date',
  'workshopOrganizer',
  'workshopFacilitator',
  'workshopCourse',
  'emailOptIn',
  'legalOptIn'
];
