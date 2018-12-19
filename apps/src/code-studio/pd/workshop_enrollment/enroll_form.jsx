/*
 * Form to create a workshop enrollment
 */
import React, {PropTypes} from 'react';
import $ from 'jquery';
import {FormGroup, Button, ControlLabel, HelpBlock} from 'react-bootstrap';
import Select from "react-select";
import {ButtonList} from '../form_components/ButtonList.jsx';
import FieldGroup from '../form_components/FieldGroup';
import {isEmail} from '@cdo/apps/util/formatValidation';
import SchoolAutocompleteDropdownWithCustomFields from '../components/schoolAutocompleteDropdownWithCustomFields';

const OTHER = "Other";
const NOT_TEACHING = "I'm not teaching this year";
const EXPLAIN = "(Please Explain):";

const CSF = "CS Fundamentals";

const VALIDATION_STATE_ERROR = "error";

const SCHOOL_TYPES_MAPPING = {
  "Public school": "public",
  "Private school": "private",
  "Charter school": "charter",
  "Other": "other"
};

const DESCRIBE_ROLES = ([
  "School Administrator",
  "District Administrator",
  "Parent",
  "Other"
]);

const ROLES = [
  "Classroom Teacher",
  "Media Specialist",
  "Tech Teacher",
  "Librarian"
].concat(DESCRIBE_ROLES);

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
      errors: {}
    };

    if (this.props.email) {
      initialState = {...initialState, ...{first_name: this.props.first_name, email: this.props.email}};
    }

    this.state = initialState;
  }

  handleChange = (change) => {
    this.setState(change);
  };

  onSchoolInfoChange = (school_info) => {
    this.setState(school_info);
  };

  handleRoleChange = (selection) => {
    this.setState({role: selection.value});
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

  role() {
    if (!this.state.role) {
      return null;
    }
    var roleWithDescription = "";
    if (this.state.describe_role) {
      roleWithDescription = `${this.state.role}: ${this.state.describe_role}`;
    } else {
      roleWithDescription = this.state.role;
    }
    return roleWithDescription;
  }

  gradesTeaching() {
    if (!this.state.grades_teaching) {
      return null;
    }
    const processedGrades = [];
    this.state.grades_teaching.forEach((g) => {
      if (g === `${OTHER} ${EXPLAIN}`) {
        if (this.state.explain_teaching_other) {
          processedGrades.push(`${OTHER}: ${this.state.explain_teaching_other}`);
        } else {
          processedGrades.push(OTHER);
        }
      } else if (g === `${NOT_TEACHING} ${EXPLAIN}`) {
        if (this.state.explain_not_teaching) {
          processedGrades.push(`${NOT_TEACHING}: ${this.state.explain_not_teaching}`);
        } else {
          processedGrades.push(NOT_TEACHING);
        }
      } else {
        processedGrades.push(g);
      }
    });
    return processedGrades;
  }

  schoolType() {
    if (!this.state.school_info.school_id) {
      return SCHOOL_TYPES_MAPPING[this.state.school_info.school_type];
    } else {
      return this.state.school_info.school_type;
    }
  }

  submit() {
    let schoolInfo = {};
    if (this.state.school_info.school_id) {
      schoolInfo = {school_id: this.state.school_info.school_id};
    } else {
      schoolInfo = {
        school_district_name: this.state.school_info.school_district_name,
        school_district_other: this.state.school_info.school_district_other,
        school_name: this.state.school_info.school_name,
        school_state: this.state.school_info.school_state,
        school_zip: this.state.school_info.school_zip,
        school_type: this.schoolType()
      };
    }
    const params = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
      school_info: schoolInfo,
      role: this.role(),
      describe_role: this.state.describe_role,
      grades_teaching: this.gradesTeaching(),
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
    const missingRequiredFields = this.getMissingRequiredFields();

    if (missingRequiredFields.length || Object.keys(errors).length) {
      let requiredFieldsErrors = {};
      missingRequiredFields.forEach((f) => {
        requiredFieldsErrors[f] = '';
      });
      errors = {...errors, ...requiredFieldsErrors};
      errors = {...errors, ...(SchoolAutocompleteDropdownWithCustomFields.validate(this.state.school_info))};
      this.setState({errors: errors});
      return false;
    }
    return true;
  }

  render() {
    const gradesLabel = (
      <div>
        What grades are you teaching this year? (Select all that apply)<span className="form-required-field"> *</span>
        <p>This workshop is intended for teachers for Grades K-5.</p>
      </div>
    );
    const gradesTeaching = GRADES_TEACHING.concat([
      {
        answerText: `${NOT_TEACHING} ${EXPLAIN}`,
        inputValue: this.state.explain_not_teaching,
        onInputChange: this.handleNotTeachingChange
      },
      {
        answerText: `${OTHER} ${EXPLAIN}`,
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
            validationState={this.state.errors.hasOwnProperty("first_name") ? VALIDATION_STATE_ERROR : null}
            errorMessage={this.state.errors.first_name}
          />
          <FieldGroup
            id="last_name"
            label="Last Name"
            type="text"
            required={true}
            onChange={this.handleChange}
            validationState={this.state.errors.hasOwnProperty("last_name") ? VALIDATION_STATE_ERROR : null}
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
            validationState={this.state.errors.hasOwnProperty("email") ? VALIDATION_STATE_ERROR : null}
            errorMessage={this.state.errors.email}
          />
          {!this.props.email &&
            <FieldGroup
              id="confirm_email"
              label="Confirm Email Address"
              type="text"
              required={true}
              onChange={this.handleChange}
              validationState={this.state.errors.hasOwnProperty("confirm_email") ? VALIDATION_STATE_ERROR : null}
              errorMessage={this.state.errors.confirm_email}
            />
          }
        </FormGroup>
        <SchoolAutocompleteDropdownWithCustomFields
          onSchoolInfoChange={this.onSchoolInfoChange}
          school_info={this.state.school_info}
          errors={this.state.errors}
        />
        {this.props.workshop_course === CSF &&
          <FormGroup>
            <FormGroup validationState={this.state.errors.hasOwnProperty("role") ? VALIDATION_STATE_ERROR : null}>
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
              {this.state && DESCRIBE_ROLES.includes(this.state.role) &&
                <FieldGroup
                  id="describe_role"
                  label="Please describe your role"
                  type="text"
                  onChange={this.handleChange}
                />
              }
            </FormGroup>
            <ButtonList
              id="grades_teaching"
              key="grades_teaching"
              answers={gradesTeaching}
              groupName="grades_teaching"
              label={gradesLabel}
              onChange={this.handleChange}
              selectedItems={this.state.grades_teaching}
              validationState={this.state.errors.hasOwnProperty("grades_teaching") ? VALIDATION_STATE_ERROR : null}
              errorText={this.state.errors.grades_teaching}
              type="check"
            />
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
          id="submit"
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
    const requiredFields = ['first_name', 'last_name', 'email'];

    if (!this.props.email) {
      requiredFields.push('confirm_email');
    }

    if (this.props.workshop_course === CSF) {
      requiredFields.push('role');
      requiredFields.push('grades_teaching');
    }

    const missingRequiredFields = requiredFields.filter(f => {
      return !this.state[f];
    });

    return missingRequiredFields;
  }

  getErrors() {
    const errors = {};

    if (this.state.email) {
      if (!isEmail(this.state.email)) {
        errors.email = "Must be a valid email address";
      }
      if (!this.props.email && this.state.email !== this.state.confirm_email) {
        errors.confirm_email = "Email addresses do not match";
      }
    }

    return errors;
  }
}
