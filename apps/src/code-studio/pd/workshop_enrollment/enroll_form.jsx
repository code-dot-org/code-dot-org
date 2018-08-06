/*
 * Form to create a workshop enrollment
 */
import React, {PropTypes} from 'react';
import {FormGroup, Button, Row, Col, ControlLabel, HelpBlock} from 'react-bootstrap';
import Select from "react-select";
import {ButtonList} from '../form_components/ButtonList.jsx';
import FieldGroup from '../form_components/FieldGroup';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import CustomSchoolInfo from '../components/customSchoolInfo';
import {
  TEACHING_ROLES,
  ROLES,
  GRADES_TEACHING,
  OTHER_SCHOOL_VALUE,
  CSF,
  ERROR
} from './enrollmentConstants';

export default class EnrollForm extends React.Component {
  static propTypes = {
    workshop_id: PropTypes.number.isRequired,
    workshop_course: PropTypes.string,
    first_name: PropTypes.string,
    email: PropTypes.string,
    onSubmissionComplete: PropTypes.func
  };

  constructor(props) {
    super(props);

    let initialState = {
      school_id: null,
      errors: {}
    };

    if (this.props.email) {
      initialState = Object.assign(initialState, {
        first_name: this.props.first_name,
        email: this.props.email
      });
    }

    this.state = initialState;
  }

  handleChange = (change) => {
    this.setState(change);
  };

  handleSchoolStateChange = (selection) => {
    let school_info = this.state.school_info;
    school_info.school_state = selection.value;
    this.setState({school_info: school_info});
  };

  handleSchoolInfoChange = (change) => {
    let school_info = Object.assign(this.state.school_info, change);
    this.setState({school_info: school_info});
  };

  handleSchoolDistrictChange = (change) => {
    let school_info = Object.assign(this.state.school_info, change);
    school_info.school_district_other = "true";
    this.setState({school_info: school_info});
  };

  handleSchoolTypeChange = (change) => {
    let school_info = Object.assign(this.state.school_info, change);
    delete(school_info.school_district_other);
    delete(school_info.school_district_name);
    this.setState({school_info: school_info});
  };

  handleRoleChange = (selection) => {
    this.setState({role: selection.value});
  };

  handleSchoolChange = (selection) => {
    this.setState({school_id: selection && selection.value});
    if (selection && selection.value !== OTHER_SCHOOL_VALUE) {
      this.setState({
        school_info: {
          school_id: selection.school.nces_id,
          school_name: selection.school.name,
          school_state: selection.school.state,
          school_zip: selection.school.zip,
          school_type: selection.school.school_type
        }
      });
    } else {
      this.setState({
        school_info: {}
      });
    }
  };

  handleNotTeachingChange = (input) => {
    this.setState({explain_not_teaching: input});
  };

  handleTeachingOtherChange = (input) => {
    this.setState({explain_teaching_other: input});
  };

  handleClickRegister = () => {
    if (this.validateRequiredFields()) {
      this.submit();
    }
  };

  submit() {
    let params = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
      school_info: {
        school_id: this.state.school_info.school_id,
        school_district_name: this.state.school_info.school_district_name,
        school_district_other: this.state.school_info.school_district_other,
        school_name: this.state.school_info.school_name,
        school_state: this.state.school_info.school_state,
        school_zip: this.state.school_info.school_zip,
        school_type: this.state.school_info.school_type,
      },
      role: this.state.role,
      grades_teaching: this.state.grades_teaching,
      explain_teaching_other: this.state.explain_teaching_other,
      explain_not_teaching: this.state.explain_not_teaching
    };
    this.submitRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${this.props.workshop_id}/enrollments`,
      contentType: 'application/json',
      data: JSON.stringify(params),
      complete: (result) => {
        this.props.onSubmissionComplete(result);
      }
    });
  }

  validateRequiredFields() {
    let errors = this.getErrors();
    let missingRequiredFields = this.getMissingRequiredFields();

    if (missingRequiredFields.length || Object.keys(errors).length) {
      let requiredFieldsErrors = {};
      missingRequiredFields.forEach((f) => {
        requiredFieldsErrors[f] = '';
      });
      errors = Object.assign(errors, requiredFieldsErrors);
      this.setState({errors: errors});
      return false;
    }
    return true;
  }

  render() {
    let roleLabel = (
      <div>
        What grades are you teaching this year? (Select all that apply)<span className="form-required-field"> *</span>
        <p>This workshop is intended for teachers for Grades K-5.</p>
      </div>
    );
    let gradesTeaching = GRADES_TEACHING.concat([
      {
        answerText: "I'm not teaching this year (Please Explain):",
        inputValue: this.state.explain_not_teaching,
        onInputChange: this.handleNotTeachingChange
      },
      {
        answerText: "Other (Please Explain):",
        inputValue: this.state.explain_teaching_other,
        onInputChange: this.handleTeachingOtherChange
      }
    ]);
    return (
      <form id="enroll-form">
        <p>
          Fields marked with a<span className="form-required-field"> * </span>
          are required.
        </p>
        <FormGroup>
          <FieldGroup
            id="first_name"
            label="First Name"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.props.first_name}
            validationState={this.state.errors.hasOwnProperty("first_name") ? ERROR : null}
            errorMessage={this.state.errors.first_name}
          />
          <FieldGroup
            id="last_name"
            label="Last Name"
            type="text"
            required={true}
            onChange={this.handleChange}
            validationState={this.state.errors.hasOwnProperty("last_name") ? ERROR : null}
            errorMessage={this.state.errors.last_name}
          />
          <FieldGroup
            id="email"
            label="Email Address"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.props.email}
            readOnly={!!this.props.email}
            title={this.props.email ? "Email can be changed in account settings" : ""}
            validationState={this.state.errors.hasOwnProperty("email") ? ERROR : null}
            errorMessage={this.state.errors.email}
          />
          {!this.props.email &&
            <FieldGroup
              id="confirm_email"
              label="Confirm Email Address"
              type="text"
              required={true}
              onChange={this.handleChange}
              validationState={this.state.errors.hasOwnProperty("confirm_email") ? ERROR : null}
              errorMessage={this.state.errors.confirm_email}
            />
          }
        </FormGroup>
        {this.state.school_id !== OTHER_SCHOOL_VALUE &&
          <FormGroup
            id="school_id"
            validationState={this.state.errors.hasOwnProperty("school_id") ? ERROR : null}
          >
            <Row>
              <Col md={6}>
                <ControlLabel>
                  School
                  <span className="form-required-field"> *</span>
                </ControlLabel>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <SchoolAutocompleteDropdown
                  value={this.state.school_id}
                  onChange={this.handleSchoolChange}
                />
              </Col>
            </Row>
            <HelpBlock>{this.state.errors.school_id}</HelpBlock>
          </FormGroup>
        }
        {this.state.school_id && this.state.school_id === OTHER_SCHOOL_VALUE &&
          <CustomSchoolInfo
            schoolInfo={this.state.school_info}
            handleSchoolInfoChange={this.handleSchoolInfoChange}
            handleSchoolStateChange={this.handleSchoolStateChange}
            handleSchoolDistrictChange={this.handleSchoolDistrictChange}
            handleSchoolTypeChange={this.handleSchoolTypeChange}
            errors={this.state.errors}
          />
        }
        {this.props.workshop_course === CSF &&
          <FormGroup
            validationState={this.state.errors.hasOwnProperty("role") ? ERROR : null}
          >
            <ControlLabel>What is your current role? (Select the role that best applies)<span className="form-required-field"> *</span></ControlLabel>
            <Select
              id="role"
              clearable={false}
              placeholder={null}
              value={this.state.role}
              onChange={this.handleRoleChange}
              options={ROLES.map(r => ({value: r, label: r}))}
            />
            <HelpBlock>{this.state.errors.role}</HelpBlock>
            {this.state && TEACHING_ROLES.includes(this.state.role) &&
              <ButtonList
                id="grades_teaching"
                key="grades_teaching"
                answers={gradesTeaching}
                groupName="grades_teaching"
                label={roleLabel}
                onChange={this.handleChange}
                selectedItems={this.state.grades_teaching}
                validationState={this.state.errors.hasOwnProperty("grades_teaching") ? ERROR : null}
                errorText={this.state.errors.grades_teaching}
                type="check"
              />
            }
          </FormGroup>
        }
        <p>
          Code.org works closely with local Regional Partners and Code.org facilitators
          to deliver the Professional Learning Program. By enrolling in this workshop,
          you are agreeing to allow Code.org to share information on how you use Code.org
          and the Professional Learning resources with your Regional Partner, school district
          and facilitators.  We will share your contact information, which courses/units
          you are using and aggregate data about your classes with these partners. This
          includes the number of students in your classes, the demographic breakdown of
          your classroom, and the name of your school and district. We will not share any
          information about individual students with our partners - all information will be
          de-identified and aggregated. Our Regional Partners and facilitators are
          contractually obliged to treat this information with the same level of
          confidentiality as Code.org.
        </p>
        <Button
          onClick={this.handleClickRegister}
        >
          Register
        </Button>
        <br/>
        <br/>
        <br/>
        <br/>
      </form>
    );
  }

  getMissingRequiredFields() {
    let schoolInfoFields = [
      'school_name',
      'school_state',
      'school_zip',
      'school_type'
    ];

    let requiredFields = ['first_name', 'last_name', 'email', 'school_id'];

    if (!this.props.email) {
      requiredFields.push('confirm_email');
    }

    if (this.state.school_id === OTHER_SCHOOL_VALUE) {
      if (["Public school", "Charter school"].includes(this.state.school_info.school_type)) {
        schoolInfoFields = schoolInfoFields.concat('school_district_name');
      }
      requiredFields = requiredFields.concat(schoolInfoFields);
    }

    if (this.props.workshop_course === CSF) {
      requiredFields.push('role');
    }

    if (TEACHING_ROLES.includes(this.state.role)) {
      requiredFields.push('grades_teaching');
    }

    let missingRequiredFields = requiredFields.filter(f => {
      if (schoolInfoFields.includes(f)) {
        return !this.state.school_info[f];
      } else {
        return !this.state[f];
      }
    });

    return missingRequiredFields;
  }

  getErrors() {
    let errors = {};

    if (this.state.email) {
      if (!isEmail(this.state.email)) {
        errors.email = "Must be a valid email address";
      }
      if (!this.props.email && this.state.email !== this.state.confirm_email) {
        errors.confirm_email = "Email addresses do not match";
      }
    }

    if (this.state.school_info && this.state.school_info.school_zip) {
      if (!isZipCode(this.state.school_info.school_zip)) {
        errors.school_zip = "Must be a valid zip code";
      }
    }

    return errors;
  }
}
