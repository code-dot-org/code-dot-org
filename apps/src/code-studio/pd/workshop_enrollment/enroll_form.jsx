/*
 * Form to create a workshop enrollment
 */
import React, {PropTypes} from 'react';
import {FormGroup, Button, Row, Col, ControlLabel} from 'react-bootstrap';
import {ButtonList} from '../form_components/ButtonList.jsx';
import Select from "react-select";
import FieldGroup from '../form_components/FieldGroup';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {STATES} from '../../../geographyConstants';

const styles = {
  indented: {
    marginLeft: 20
  },
  outdented: {
    marginLeft: -20
  }
};

const TEACHING_ROLES = [
  "Classroom Teacher",
  "Librarian",
  "Tech Teacher/Media Specialist"
];

const ROLES = TEACHING_ROLES.concat([
  "Parent",
  "School Administrator",
  "District Administrator",
  "Other"
]);

const GRADES_TEACHING = [
  "Pre-K",
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6-8",
  "Grade 9-12"
];

const SCHOOL_TYPES = [
  "Public school",
  "Private school",
  "Charter school",
  "Other"
];

const OTHER_SCHOOL_VALUE = "-1";

const CSF = "CS Fundamentals";

const REQUIRED = "Required";

const ERROR = 'error';

export default class EnrollForm extends React.Component {
  static propTypes = {
    workshop_id: PropTypes.number.isRequired,
    workshop_course: PropTypes.string,
    logged_in: PropTypes.bool,
    first_name: PropTypes.string,
    email: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      school_id: null,
      errors: {}
    };

    if (this.props.logged_in) {
      this.setState = {
        firstName: this.props.first_name,
        email: this.props.email
      };
    }
  }

  handleChange = (change) => {
    this.setState(change);
  };

  handleSchoolStateChange = (selection) => {
    let school_info = this.state.school_info;
    school_info.school_state = selection.value;
    this.setState({school_info: school_info});
  };

  handleSchoolInfoChange = (selection) => {
    let school_info = Object.assign(this.state.school_info, selection);
    this.setState({school_info: school_info});
  };

  handleRoleChange = (selection) => {
    this.setState({role: selection.value});
  };

  handleSchoolChange = (selection) => {
    this.setState({school_id: selection.value});
    // can i just do school_info: {selection.school} ?
    if (selection.value !== OTHER_SCHOOL_VALUE) {
      this.setState({
        school_info: {
          school_state: selection.school.state,
          school_zip: selection.school.zip,
          school_id: selection.school.nces_id,
          school_name: selection.school.name,
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

  onRegister = () => {
    if (this.validateRequiredFields()) {
      this.submit();
    }
  };

  submit() {
    this.submitRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${this.props.workshop_id}/enrollments`,
      contentType: 'application/json',
      data: JSON.stringify(this.state), // only send necessary fields
      complete: () => {
        console.log('complete');
      }
    });
  }

  validateRequiredFields() {
    let errors = this.getErrors();
    let missingRequiredFields = this.getMissingRequiredFields();

    if (missingRequiredFields.length || Object.keys(errors).length) {
      let requiredFieldsErrors = {};
      missingRequiredFields.forEach((f) => {
        requiredFieldsErrors[f] = REQUIRED;
      });
      errors = Object.assign(errors, requiredFieldsErrors);
      this.setState({errors: errors});
      console.log(errors);
      console.log(missingRequiredFields);
      return false;
    }
    return true;
  }

  readOnlyEmail() {
    if (this.props.email) {
      return true;
    }
    return false;
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
      <form>
        <p>
          Fields marked with a<span className="form-required-field"> * </span>
          are required.
        </p>
        <FormGroup style={styles.indented}>
          <FieldGroup
            id="first_name"
            label="First Name"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.props.first_name}
            validationState={this.state.errors.hasOwnProperty("first_name") ? ERROR : null}
          />
          <FieldGroup
            id="last_name"
            label="Last Name"
            type="text"
            required={true}
            onChange={this.handleChange}
            validationState={this.state.errors.hasOwnProperty("last_name") ? ERROR : null}
          />
          <FieldGroup
            id="email"
            label="Email Address"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.props.email}
            readOnly={this.readOnlyEmail()}
            title={this.readOnlyEmail() ? "Email can be changed in account settings" : ""}
            validationState={this.state.errors.hasOwnProperty("email") ? ERROR : null}
          />
          {!this.props.logged_in &&
            <FieldGroup
              id="confirm_email"
              label="Confirm Email Address"
              type="text"
              required={true}
              onChange={this.handleChange}
              validationState={this.state.errors.hasOwnProperty("confirm_email") ? ERROR : null}
            />
          }
        </FormGroup>
        {this.state.school_id !== OTHER_SCHOOL_VALUE &&
          <FormGroup
            id="school_id"
            style={styles.indented}
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
              <Col md={6}>
                <SchoolAutocompleteDropdown
                  value={this.state.school_id}
                  onChange={this.handleSchoolChange}
                />
              </Col>
            </Row>
          </FormGroup>
        }
        {this.state.school_id && this.state.school_id === OTHER_SCHOOL_VALUE &&
          <FormGroup style={styles.indented}>
            <FieldGroup
              id="school_name"
              label="School Name"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
              validationState={this.state.errors.hasOwnProperty("school_name") ? ERROR : null}
            />
            <FieldGroup
              id="school_address"
              label="School Address"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
              validationState={this.state.errors.hasOwnProperty("school_address") ? ERROR : null}
            />
            <FieldGroup
              id="school_city"
              label="School City"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
              validationState={this.state.errors.hasOwnProperty("school_city") ? ERROR : null}
            />
            <FormGroup
              id="school_state"
              style={styles.outdented}
              validationState={this.state.errors.hasOwnProperty("school_state") ? ERROR : null}
            >
              <ControlLabel>School State<span className="form-required-field"> *</span></ControlLabel>
              <Select
                value={this.state.school_info ? this.state.school_info.school_state : null}
                onChange={this.handleSchoolStateChange}
                options={STATES.map(v => ({value: v, label: v}))}
                clearable={false}
              />
            </FormGroup>
            <FieldGroup
              id="school_zip"
              label="School Zip Code"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
              validationState={this.state.errors.hasOwnProperty("school_zip") ? ERROR : null}
            />
            <ButtonList
              key="school_type"
              answers={SCHOOL_TYPES}
              groupName="school_type"
              label="My school is a"
              onChange={this.handleSchoolInfoChange}
              selectedItems={this.state.school_type}
              validationState={this.state.errors.hasOwnProperty("school_type") ? ERROR : null}
              type="radio"
              required={true}
            />
          </FormGroup>
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
          onClick={this.onRegister}
        >
          Register
        </Button>
      </form>
    );
  }

  getMissingRequiredFields() {
    const schoolInfoFields = [
      'school_name',
      'school_address',
      'school_city',
      'school_state',
      'school_zip',
      'school_type'
    ];

    let requiredFields = ['first_name', 'last_name', 'email', 'school_id'];

    if (!this.state.logged_in) {
      requiredFields = requiredFields.push('confirm_email');
    }

    if (this.state.school_id === OTHER_SCHOOL_VALUE) {
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
      if (!this.state.logged_in && this.state.email !== this.state.confirm_email) {
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
