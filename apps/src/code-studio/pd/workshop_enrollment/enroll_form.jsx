/*
 * Form to create a workshop enrollment
 */
import React, {PropTypes} from 'react';
import {FormGroup, Button, Row, Col, ControlLabel, Checkbox} from 'react-bootstrap';
import Select from "react-select";
import FieldGroup from '../form_components/FieldGroup';
import {isEmail} from '@cdo/apps/util/formatValidation';
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
  "Grade 9-12",
  "I'm not teaching this year (Please Explain):",
  "Other (Please Explain):"
];

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
      school_id: null
    };

    if (this.props.logged_in) {
      this.setState = {
        firstName: this.props.first_name,
        email: this.props.email,
        confirmEmail: this.props.email
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

  handleGradesTeachingChange = (e) => {
    e.preventDefault();
    let gradesTeaching = this.state.grades_teaching || [];
    if (e.target.checked) {
      gradesTeaching.push(e.target.value);
    } else {
      let indexToRemove = gradesTeaching.indexOf(e.target.value);
      gradesTeaching.splice(indexToRemove, 1);
    }
    this.setState({grades_teaching: gradesTeaching});
  };

  handleSchoolChange = (selection) => {
    this.setState({school_id: selection.value});
    // can i just do school_info: {selection.school} ?
    if (selection.value !== "-1") {
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
      data: JSON.stringify(this.state), // take out confirmEmail
      complete: () => {
        console.log('complete');
      }
    });
  }

  validateRequiredFields() {
    let errors = this.getErrors();
    let missingRequiredFields = this.requiredFields.filter(f => !this.state[f]);

    if (missingRequiredFields.length || Object.keys(errors).length) {
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
          />
          <FieldGroup
            id="last_name"
            label="Last Name"
            type="text"
            required={true}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="email"
            label="Email Address"
            type="email"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.props.email}
            readOnly={this.readOnlyEmail()}
            title={this.readOnlyEmail() ? "Email can be changed in account settings" : ""}
          />
          {
            !this.props.logged_in &&
            <FieldGroup
              id="confirm_email"
              label="Confirm Email Address"
              type="email"
              required={true}
              onChange={this.handleChange}
            />
          }
        </FormGroup>
        {this.state && this.state.school_id !== '-1' &&
          <FormGroup
            id="school"
            style={styles.indented}
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
        {this.state && this.state.school_id && this.state.school_id === '-1' &&
          <FormGroup style={styles.indented}>
            <FieldGroup
              id="school_name"
              label="School Name"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
            />
            <FieldGroup
              id="school_address"
              label="School Address"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
            />
            <FieldGroup
              id="school_city"
              label="School City"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
            />
            <FormGroup style={styles.outdented}>
              <ControlLabel>School State</ControlLabel>
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
            />
            {/* radio buttons for school type */}
          </FormGroup>
        }
        {this.props.workshop_course === 'CS Fundamentals' &&
          <FormGroup>
            <ControlLabel>What is your current role? (Select the role that best applies)<span className="form-required-field"> *</span></ControlLabel>
            <Select
              clearable={false}
              placeholder={null}
              value={this.state.role}
              onChange={this.handleRoleChange}
              options={ROLES.map(r => ({value: r, label: r}))}
            />
          {this.state && TEACHING_ROLES.includes(this.state.role) &&
            <FormGroup>
              <ControlLabel>What grades are you teaching this year? (Select all that apply)<span className="form-required-field"> *</span></ControlLabel>
              <p>This workshop is intended for teachers for Grades K-5.</p>
              {GRADES_TEACHING.map((grade, index) =>
                <Checkbox
                  value={grade}
                  key={index}
                  onChange={this.handleGradesTeachingChange}
                >
                  {grade}
                </Checkbox>
              )}
            </FormGroup>
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

  requiredFields = ['firstName', 'lastName', 'email'];

  getErrors() {
    let errors = {};

    if (this.state.email) {
      if (!isEmail(this.state.email)) {
        errors.email = "Must be a valid email address";
      }
      if (!this.state.logged_in && this.state.confirmEmail && this.state.email !== this.state.confirmEmail) {
        errors.confirmEmail = "Email addresses do not match";
      }
    }

    return errors;
  }
}
