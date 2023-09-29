import PropTypes from 'prop-types';
import React from 'react';
import FormController from '../form_components/FormController';
import FormComponent from '../form_components/FormComponent';
import DatePicker from '../workshop_dashboard/components/date_picker';
import moment from 'moment';
import {DATE_FORMAT} from '../workshop_dashboard/workshopConstants';
import {Row, Col, ControlLabel, FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {snakeCase} from 'lodash';

export default class InternationalOptIn extends FormController {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired,
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
      labels: this.props.labels,
    };
  }
}

class InternationalOptInComponent extends FormComponent {
  static propTypes = {
    accountEmail: PropTypes.string.isRequired,
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
    return getCountryKey(this.props.data?.schoolCountry) === 'colombia';
  }

  /**
   * We also have some special logic in place for Chile, so define a
   * helper here to let us easily detect if we're in a state where that logic
   * should be applied.
   *
   * @returns {boolean}
   */
  isChileSelected() {
    return getCountryKey(this.props.data?.schoolCountry) === 'chile';
  }

  /**
   * We also have some special logic in place for Uzbekistan, so define a
   * helper here to let us easily detect if we're in a state where that logic
   * should be applied.
   *
   * @returns {boolean}
   */
  isUzbekistanSelected() {
    return getCountryKey(this.props.data?.schoolCountry) === 'uzbekistan';
  }

  /**
   * If Colombia or Chile is selected as the school's country, we use a hierarchy of
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
    if (
      !this.isColombiaSelected() &&
      !this.isChileSelected() &&
      !this.isUzbekistanSelected()
    ) {
      return newState;
    }

    // Clear out dependent selections. Note that the order here is important to
    // allow the change to propagate all the way down.
    if ('schoolCountry' in newState) {
      // school country changed, clearing department
      newState.schoolDepartment = undefined;
    }
    if ('schoolDepartment' in newState) {
      // school department changed, clearing municipality and commune
      newState.schoolMunicipality = undefined;
      newState.schoolCommune = undefined;
    }
    if ('schoolMunicipality' in newState) {
      // school municipality changed, clearing city and school name
      newState.schoolCity = undefined;
      newState.schoolName = undefined;
    }
    if ('schoolCity' in newState || 'schoolCommune' in newState) {
      // school city/commune changed, clearing name
      newState.schoolName = undefined;
    }
    if ('schoolName' in newState) {
      newState.schoolId = undefined;
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
    const departmentOptions = Object.keys(departments);
    departmentOptions.unshift(i18n.pdNotApplicable());
    const selectDepartment = this.buildSelectFieldGroup({
      name: 'schoolDepartment',
      label: this.props.labels.colombianChileanSchoolDepartment,
      options: departmentOptions,
      placeholder: i18n.selectAnOption(),
      required: true,
    });

    const municipalities = departments[selectedDepartment] || {};
    let municipalityOptions = [i18n.pdNotApplicable()];
    if (selectedDepartment !== i18n.pdNotApplicable()) {
      municipalityOptions = municipalityOptions.concat(
        Object.keys(municipalities)
      );
    }
    const selectMunicipality = this.buildSelectFieldGroup({
      name: 'schoolMunicipality',
      label: this.props.labels.colombianSchoolMunicipality,
      options: municipalityOptions,
      disabled: !selectedDepartment,
      placeholder: selectedDepartment
        ? i18n.selectAnOption()
        : i18n.selectDepartmentFirst(),
      required: true,
    });

    const cities = municipalities[selectedMunicipality] || {};
    let cityOptions = [i18n.pdNotApplicable()];
    if (selectedMunicipality !== i18n.pdNotApplicable()) {
      cityOptions = cityOptions.concat(Object.keys(cities));
    }
    const selectCity = this.buildSelectFieldGroup({
      name: 'schoolCity',
      label: this.props.labels.colombianSchoolCity,
      options: cityOptions,
      disabled: !selectedMunicipality,
      placeholder: selectedMunicipality
        ? i18n.selectAnOption()
        : i18n.selectMunicipalityFirst(),
      required: true,
    });

    const names = cities[selectedCity] || [];
    let nameOptions = [i18n.pdNotApplicable()];
    if (selectedCity !== i18n.pdNotApplicable()) {
      nameOptions = nameOptions.concat(names);
    }
    const selectName = this.buildSelectFieldGroup({
      name: 'schoolName',
      label: this.props.labels.colombianChileanSchoolName,
      options: nameOptions,
      disabled: !selectedCity,
      placeholder: selectedCity
        ? i18n.selectAnOption()
        : i18n.selectCityFirst(),
      required: true,
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

  /**
   * Similarly, if they have selected Chile as their country, we want to display dropdowns
   * for city and name.
   *
   * @returns {Component}
   */
  renderChileanSchoolDataFieldGroup() {
    const selectedDepartment =
      this.props.data && this.props.data.schoolDepartment;
    const selectedCommune =
      selectedDepartment && this.props.data && this.props.data.schoolCommune;
    const selectedName =
      selectedCommune && this.props.data && this.props.data.schoolName;

    const departments = this.props.options.chileanSchoolData || {};
    const departmentOptions = Object.keys(departments);
    departmentOptions.unshift(i18n.pdNotApplicable());
    const selectDepartment = this.buildSelectFieldGroup({
      name: 'schoolDepartment',
      label: this.props.labels.colombianChileanSchoolDepartment,
      options: departmentOptions,
      placeholder: i18n.selectAnOption(),
      required: true,
    });

    const communes = departments[selectedDepartment] || {};
    let communeOptions = [i18n.pdNotApplicable()];
    if (selectedDepartment !== i18n.pdNotApplicable()) {
      communeOptions = communeOptions.concat(Object.keys(communes));
    }
    const selectCommune = this.buildSelectFieldGroup({
      name: 'schoolCommune',
      label: this.props.labels.chileanSchoolCommune,
      options: communeOptions,
      disabled: !selectedDepartment,
      placeholder: selectedDepartment
        ? i18n.selectAnOption()
        : i18n.selectDepartmentFirst(),
      required: true,
    });

    const names = communes[selectedCommune] || {};
    let nameOptions = [i18n.pdNotApplicable()];
    if (selectedCommune !== i18n.pdNotApplicable()) {
      nameOptions = nameOptions.concat(Object.keys(names));
    }
    const selectName = this.buildSelectFieldGroup({
      name: 'schoolName',
      label: this.props.labels.colombianChileanSchoolName,
      options: nameOptions,
      disabled: !selectedCommune,
      placeholder: selectedCommune
        ? i18n.selectAnOption()
        : i18n.selectCommuneFirst(),
      required: true,
    });

    const ids = names[selectedName] || [];
    let idOptions = [i18n.pdNotApplicable()];
    if (selectedName !== i18n.pdNotApplicable()) {
      idOptions = idOptions.concat(ids);
    }
    const selectId = this.buildSelectFieldGroup({
      name: 'schoolId',
      label: this.props.labels.chileanSchoolId,
      options: idOptions,
      disabled: !selectedName,
      placeholder: selectedName
        ? i18n.selectAnOption()
        : i18n.selectNameFirst(),
      required: true,
    });

    return (
      <FormGroup>
        {selectDepartment}
        {selectCommune}
        {selectName}
        {selectId}
      </FormGroup>
    );
  }

  /**
   * Similarly, if they have selected Uzbekistan as their country, we want to display dropdowns
   * for city/district and school.
   *
   * @returns {Component}
   */
  renderUzebekistanSchoolDataFieldGroup() {
    const selectedDepartment =
      this.props.data && this.props.data.schoolDepartment;
    const selectedDistrict =
      selectedDepartment &&
      this.props.data &&
      this.props.data.schoolMunicipality;

    const departments = this.props.options.uzbekistanSchoolData || {};
    const departmentOptions = Object.keys(departments);
    departmentOptions.unshift(i18n.pdNotApplicable());
    const selectDepartment = this.buildSelectFieldGroup({
      name: 'schoolDepartment',
      label: this.props.labels.schoolDepartmentRegion,
      options: departmentOptions,
      placeholder: i18n.selectAnOption(),
      required: true,
    });

    const districts = departments[selectedDepartment] || {};
    let districtOptions = [i18n.pdNotApplicable()];
    if (selectedDepartment !== i18n.pdNotApplicable()) {
      districtOptions = districtOptions.concat(Object.keys(districts));
    }
    const selectDistrict = this.buildSelectFieldGroup({
      name: 'schoolMunicipality',
      label: this.props.labels.schoolCityDistrict,
      options: districtOptions,
      disabled: !selectedDepartment,
      placeholder: selectedDepartment
        ? i18n.selectAnOption()
        : i18n.selectDepartmentFirst(),
      required: true,
    });

    const schools = districts[selectedDistrict] || [];
    let schoolOptions = [i18n.pdNotApplicable()];
    if (selectDistrict !== i18n.pdNotApplicable()) {
      schoolOptions = schoolOptions.concat(schools);
    }
    const selectSchool = this.buildSelectFieldGroup({
      name: 'schoolName',
      label: this.props.labels.school,
      options: schoolOptions,
      disabled: !selectedDistrict,
      placeholder: selectedDistrict
        ? i18n.selectAnOption()
        : i18n.selectDistrictFirst(),
      required: true,
    });

    return (
      <FormGroup>
        {selectDepartment}
        {selectDistrict}
        {selectSchool}
      </FormGroup>
    );
  }

  renderSchoolFieldGroups() {
    let schoolDataFieldGroup;
    const selectedCountry = this.props.data?.schoolCountry;
    if (this.isColombiaSelected()) {
      schoolDataFieldGroup = this.renderColombianSchoolDataFieldGroup();
    } else if (this.isChileSelected()) {
      schoolDataFieldGroup = this.renderChileanSchoolDataFieldGroup();
    } else if (this.isUzbekistanSelected()) {
      schoolDataFieldGroup = this.renderUzebekistanSchoolDataFieldGroup();
    } else {
      // If no country has been selected, display the inputs disabled with a
      // placeholder text asking the user to select their country first.
      // Otherwise, if they've selected a non-Colombian/Chilean country, just render
      // the inputs normally.
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
            required: true,
          })}
          {this.buildFieldGroup({
            name: 'schoolName',
            label: this.props.labels.schoolName,
            type: 'text',
            disabled: !selectedCountry,
            placeholder,
            required: true,
          })}
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <br />
        <h4>{i18n.yourSchoolTellUs()}</h4>
        {this.buildSelectFieldGroupFromOptions({
          name: 'schoolCountry',
          label: this.props.labels.schoolCountry,
          required: true,
          placeholder: i18n.selectAnOption(),
        })}
        {schoolDataFieldGroup}
      </FormGroup>
    );
  }

  renderWorkshopFieldGroups() {
    // If no country has been selected, display the inputs disabled with a
    // placeholder text asking the user to select their country first.
    const selectedCountry = this.props.data?.schoolCountry;
    const placeholder = selectedCountry ? undefined : i18n.selectCountryFirst();

    const organizers = this.props.options.workshopOrganizer[
      getCountryKey(selectedCountry)
    ] || [i18n.organizerNotListed()];
    const selectOrganizer = this.buildSelectFieldGroup({
      name: 'workshopOrganizer',
      label: this.props.labels.workshopOrganizer,
      options: organizers,
      disabled: !selectedCountry,
      placeholder: selectedCountry ? i18n.selectAnOption() : placeholder,
      required: true,
    });

    return <FormGroup>{selectOrganizer}</FormGroup>;
  }

  render() {
    const labels = this.props.labels;

    return (
      <FormGroup>
        <br />
        <h4>{i18n.tellUsAboutYourself()}</h4>

        {/* Personal */}
        {this.buildFieldGroup({
          name: 'firstName',
          label: labels.firstName,
          type: 'text',
          required: true,
        })}
        {this.buildFieldGroup({
          name: 'firstNamePreferred',
          label: labels.firstNamePreferred,
          type: 'text',
          required: false,
        })}
        {this.buildFieldGroup({
          name: 'lastName',
          label: labels.lastName,
          type: 'text',
          required: true,
        })}
        {this.buildFieldGroup({
          name: 'email',
          label: labels.email,
          type: 'text',
          value: this.props.accountEmail,
          readOnly: true,
        })}

        {/* School */}
        {this.renderSchoolFieldGroups()}

        <br />
        <h4>{i18n.tellUsAboutWorkshop()}</h4>

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
        {this.renderWorkshopFieldGroups()}
        {this.buildSelectFieldGroupFromOptions({
          name: 'workshopCourse',
          label: labels.workshopCourse,
          required: true,
          placeholder: i18n.selectAnOption(),
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
          placeholder: i18n.selectAnOption(),
        })}
        {this.buildSingleCheckbox({
          name: 'legalOptIn',
          label: labels.legalOptIn,
          required: true,
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

function getCountryKey(countryName) {
  return snakeCase(countryName);
}

InternationalOptInComponent.associatedFields = [
  'firstName',
  'firstNamePreferred',
  'lastName',
  'email',
  'schoolName',
  'schoolCity',
  'schoolCountry',
  'date',
  'workshopOrganizer',
  'workshopCourse',
  'emailOptIn',
  'legalOptIn',
];
