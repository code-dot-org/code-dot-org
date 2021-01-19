/*
 * Form to create a workshop enrollment
 */
import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import {FormGroup, Button, ControlLabel, HelpBlock} from 'react-bootstrap';
import Select from 'react-select';
import {ButtonList} from '../form_components/ButtonList.jsx';
import FieldGroup from '../form_components/FieldGroup';
import QuestionsTable from '../form_components/QuestionsTable';
import {isEmail} from '@cdo/apps/util/formatValidation';
import SchoolAutocompleteDropdownWithCustomFields from '../components/schoolAutocompleteDropdownWithCustomFields';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const OTHER = 'Other';
const NOT_TEACHING = "I'm not teaching this year";
const EXPLAIN = '(Please Explain):';

const CSF = 'CS Fundamentals';
const INTRO = SubjectNames.SUBJECT_CSF_101;
const DEEP_DIVE = SubjectNames.SUBJECT_CSF_201;

const CSP = 'CS Principles';

const VALIDATION_STATE_ERROR = 'error';

const SCHOOL_TYPES_MAPPING = {
  'Public school': 'public',
  'Private school': 'private',
  'Charter school': 'charter',
  Other: 'other'
};

const DESCRIBE_ROLES = [
  'School Administrator',
  'District Administrator',
  'Parent',
  'Other'
];

const ROLES = [
  'Classroom Teacher',
  'Media Specialist',
  'Tech Teacher',
  'Librarian'
].concat(DESCRIBE_ROLES);

const GRADES_TEACHING = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6-8',
  'Grade 9-12'
];

const CSF_COURSES = {
  courseA: 'Course A',
  courseB: 'Course B',
  courseC: 'Course C',
  courseD: 'Course D',
  courseE: 'Course E',
  courseF: 'Course F',
  express: 'Express',
  courses14_accelerated: 'Courses 1-4 or Accelerated'
};

const ATTENDED_CSF_COURSES_OPTIONS = {
  'Yes, I attended a CS Fundamentals Intro workshop this academic year.':
    'Yes, this year',
  'Yes, I attended a CS Fundamentals Intro workshop in a previous academic year.':
    'Yes, prior year',
  'Nope, I have never attended a CS Fundamentals workshop.': 'No'
};

const CSF_HAS_CURIICULUM_COPY_OPTIONS = {
  'Yes, and I will bring it to the workshop.': 'Yes',
  'Nope. I will need a new copy provided. Thanks!': 'No'
};

const REPLACE_EXISTING_OPTIONS = [
  'Yes, this course will replace an existing computer science course',
  'No, this course will be added to the schedule in addition to an existing computer science course',
  'No, this will be the only computer science course on the master schedule',
  'I don’t know'
];

export default class EnrollForm extends React.Component {
  static propTypes = {
    workshop_id: PropTypes.number.isRequired,
    workshop_course: PropTypes.string,
    first_name: PropTypes.string,
    email: PropTypes.string,
    onSubmissionComplete: PropTypes.func,
    workshop_subject: PropTypes.string,
    previous_courses: PropTypes.arrayOf(PropTypes.string).isRequired,
    collect_demographics: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      first_name: this.props.first_name,
      email: this.props.email,
      isSubmitting: false,
      errors: {}
    };
  }

  handleChange = change => {
    this.setState(change);
  };

  onSchoolInfoChange = school_info => {
    this.setState(school_info);
  };

  handleRoleChange = selection => {
    this.setState({role: selection.value});
  };

  handleNotTeachingChange = input => {
    this.setState({explain_not_teaching: input});
  };

  handleTeachingOtherChange = input => {
    this.setState({explain_teaching_other: input});
  };

  handleCsfCourseOtherChange = input => {
    this.setState({explain_csf_course_other: input});
  };

  handleCsfCourseExperienceChange = input => {
    let exp;
    if (this.state.csf_course_experience) {
      exp = this.state.csf_course_experience;
    } else {
      exp = {};
    }
    Object.keys(input).map(key => (exp[CSF_COURSES[key]] = input[key]));
    this.setState({csf_course_experience: exp});
  };

  handleClickRegister = () => {
    if (this.validateRequiredFields()) {
      this.setState({isSubmitting: true});
      this.submit();
    }
  };

  role() {
    if (!this.state.role) {
      return null;
    }
    var roleWithDescription = '';
    if (this.state.describe_role) {
      roleWithDescription = `${this.state.role}: ${this.state.describe_role}`;
    } else {
      roleWithDescription = this.state.role;
    }
    return roleWithDescription;
  }

  csfCoursesPlanned() {
    if (!this.state.csf_courses_planned) {
      return undefined;
    }
    const processedCourses = [];
    this.state.csf_courses_planned.forEach(g => {
      if (g === `${OTHER} ${EXPLAIN}`) {
        if (this.state.explain_csf_course_other) {
          processedCourses.push(
            `${OTHER}: ${this.state.explain_csf_course_other}`
          );
        } else {
          processedCourses.push(OTHER);
        }
      } else {
        processedCourses.push(g);
      }
    });
    return processedCourses;
  }

  gradesTeaching() {
    if (!this.state.grades_teaching) {
      return null;
    }
    const processedGrades = [];
    this.state.grades_teaching.forEach(g => {
      if (g === `${OTHER} ${EXPLAIN}`) {
        if (this.state.explain_teaching_other) {
          processedGrades.push(
            `${OTHER}: ${this.state.explain_teaching_other}`
          );
        } else {
          processedGrades.push(OTHER);
        }
      } else if (g === `${NOT_TEACHING} ${EXPLAIN}`) {
        if (this.state.explain_not_teaching) {
          processedGrades.push(
            `${NOT_TEACHING}: ${this.state.explain_not_teaching}`
          );
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
      explain_not_teaching: this.state.explain_not_teaching,
      csf_course_experience: this.state.csf_course_experience,
      csf_courses_planned: this.csfCoursesPlanned(),
      explain_csf_course_other: this.state.explain_csf_course_other,
      attended_csf_intro_workshop:
        ATTENDED_CSF_COURSES_OPTIONS[this.state.attended_csf_intro_workshop],
      csf_has_physical_curriculum_guide:
        CSF_HAS_CURIICULUM_COPY_OPTIONS[
          this.state.csf_has_physical_curriculum_guide
        ],
      previous_courses: this.state.previous_courses,
      replace_existing: this.state.replace_existing,
      csf_intro_intent: this.state.csf_intro_intent,
      csf_intro_other_factors: this.state.csf_intro_other_factors,
      years_teaching: this.state.years_teaching,
      years_teaching_cs: this.state.years_teaching_cs,
      taught_ap_before: this.state.taught_ap_before,
      planning_to_teach_ap: this.state.planning_to_teach_ap
    };
    this.submitRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${this.props.workshop_id}/enrollments`,
      contentType: 'application/json',
      data: JSON.stringify(params),
      complete: result => {
        this.setState({isSubmitting: false});
        this.props.onSubmissionComplete(result);
      }
    });
  }

  validateRequiredFields() {
    let errors = this.getErrors();
    const missingRequiredFields = this.getMissingRequiredFields();
    const schoolInfoErrors = SchoolAutocompleteDropdownWithCustomFields.validate(
      this.state.school_info
    );

    if (
      missingRequiredFields.length ||
      Object.keys(errors).length ||
      Object.keys(schoolInfoErrors).length
    ) {
      let requiredFieldsErrors = {};
      missingRequiredFields.forEach(f => {
        requiredFieldsErrors[f] = '';
      });
      errors = {...errors, ...requiredFieldsErrors, ...schoolInfoErrors};
      this.setState({errors: errors});
      return false;
    }
    return true;
  }

  render() {
    const gradesLabel = (
      <div>
        What grades are you teaching this year? (Select all that apply)
        <span className="form-required-field"> *</span>
        <p>This workshop is intended for teachers of grades K-5.</p>
      </div>
    );
    const coursesPlannedLabel = (
      <div>
        Which CS Fundamentals course(s), if any, do you plan to{' '}
        <strong>use more of</strong> in the next 12 months? Check all that
        apply.
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

    const csfIntroIntentLabel =
      `Most teachers register for the Intro workshop in order to learn how to ` +
      `teach a CS Fundamentals course during the current or upcoming academic year. Is this also ` +
      `true of your interest in registering for this workshop?`;
    const csfIntroIntentAnswers = ['Yes', 'No', 'Unsure'];

    const csfIntroOtherFactorsLabel = `What other factors might influence your registration? Check all that apply.`;
    const csfIntroOtherFactorsAnswers = [
      'I am newly assigned to teach computer science and want help getting started.',
      'Teaching computer science is one of my teaching duties.',
      'I am interested in teaching CS Fundamentals.',
      'I have administrator support to teach CS Fundamentals.',
      'I have available time on my schedule for teaching computer science.',
      'I want to learn computer science concepts.',
      'Computer science is a required subject in my region.',
      'I am here to bring information back to my school or district.'
    ];

    const cspReturningTeachersTaughtAPLabel = `Have you taught an Advanced Placement (AP) course before?`;
    const cspReturningTeachersTaughtAPAnswers = [
      'Yes, AP CS Principles or AP CS A',
      'Yes, but in another subject',
      'No'
    ];

    const cspReturningTeachersPlanningAPLabel = `Are you planning to teach CS Principles as an AP course?`;
    const cspReturningTeachersPlanningAPAnswers = [
      'Yes',
      'No',
      'Both AP and non-AP',
      'Unsure / Still deciding'
    ];

    const csfCourses = Object.keys(CSF_COURSES)
      .filter(key => key !== 'courses14_accelerated')
      .map(key => CSF_COURSES[key])
      .concat([
        {
          answerText: `${OTHER} ${EXPLAIN}`,
          inputValue: this.state.explain_csf_course_other,
          onInputChange: this.handleCsfCourseOtherChange
        }
      ]);
    const previousCourses = this.props.previous_courses.concat([
      'I don’t have experience teaching any of these courses'
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
            validationState={
              this.state.errors.hasOwnProperty('first_name')
                ? VALIDATION_STATE_ERROR
                : null
            }
            errorMessage={this.state.errors.first_name}
          />
          <FieldGroup
            id="last_name"
            label="Last Name"
            type="text"
            required={true}
            onChange={this.handleChange}
            validationState={
              this.state.errors.hasOwnProperty('last_name')
                ? VALIDATION_STATE_ERROR
                : null
            }
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
            title={
              this.props.email ? 'Email can be changed in account settings' : ''
            }
            validationState={
              this.state.errors.hasOwnProperty('email')
                ? VALIDATION_STATE_ERROR
                : null
            }
            errorMessage={this.state.errors.email}
          />
          {!this.props.email && (
            <FieldGroup
              id="confirm_email"
              label="Confirm Email Address"
              type="text"
              required={true}
              onChange={this.handleChange}
              validationState={
                this.state.errors.hasOwnProperty('confirm_email')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorMessage={this.state.errors.confirm_email}
            />
          )}
        </FormGroup>
        <SchoolAutocompleteDropdownWithCustomFields
          onSchoolInfoChange={this.onSchoolInfoChange}
          school_info={this.state.school_info}
          errors={this.state.errors}
        />
        {this.props.workshop_course === CSF && (
          <FormGroup>
            <FormGroup
              validationState={
                this.state.errors.hasOwnProperty('role')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
            >
              <ControlLabel>
                What is your current role? (Select the role that best applies)
                <span className="form-required-field"> *</span>
              </ControlLabel>
              <Select
                id="role"
                clearable={false}
                placeholder={null}
                value={this.state.role}
                onChange={this.handleRoleChange}
                options={ROLES.map(r => ({value: r, label: r}))}
              />
              <HelpBlock>{this.state.errors.role}</HelpBlock>
              {this.state && DESCRIBE_ROLES.includes(this.state.role) && (
                <FieldGroup
                  id="describe_role"
                  label="Please describe your role"
                  type="text"
                  onChange={this.handleChange}
                />
              )}
            </FormGroup>
            <ButtonList
              id="grades_teaching"
              key="grades_teaching"
              answers={gradesTeaching}
              groupName="grades_teaching"
              label={gradesLabel}
              onChange={this.handleChange}
              selectedItems={this.state.grades_teaching}
              validationState={
                this.state.errors.hasOwnProperty('grades_teaching')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={this.state.errors.grades_teaching}
              type="check"
            />
          </FormGroup>
        )}
        {this.props.workshop_course === CSF &&
          this.props.workshop_subject === INTRO && (
            <ButtonList
              groupName="csf_intro_intent"
              type="radio"
              required
              label={csfIntroIntentLabel}
              answers={csfIntroIntentAnswers}
              onChange={this.handleChange}
              selectedItems={this.state.csf_intro_intent}
              validationState={
                this.state.errors.hasOwnProperty('csf_intro_intent')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={this.state.errors.csf_intro_intent}
            />
          )}
        {this.props.workshop_course === CSF &&
          this.props.workshop_subject === INTRO && (
            <ButtonList
              groupName="csf_intro_other_factors"
              type="check"
              label={csfIntroOtherFactorsLabel}
              answers={csfIntroOtherFactorsAnswers}
              onChange={this.handleChange}
              selectedItems={this.state.csf_intro_other_factors}
              validationState={
                this.state.errors.hasOwnProperty('csf_intro_other_factors')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={this.state.errors.csf_intro_other_factors}
            />
          )}
        {this.props.workshop_course === CSF &&
          this.props.workshop_subject === DEEP_DIVE && (
            <FormGroup>
              <QuestionsTable
                id="csf_course_experience"
                key="csf_course_experience"
                label="This workshop is designed for educators that have experience teaching CS Fundamentals. During the past year, how have you used CS Fundamentals course(s) with students?"
                onChange={this.handleCsfCourseExperienceChange}
                options={[
                  'none',
                  'a few lessons',
                  'most lessons',
                  'all lessons'
                ]}
                questions={Object.keys(CSF_COURSES).map(key => ({
                  label: CSF_COURSES[key],
                  name: key
                }))}
                selectedItems={this.state.csf_course_experience}
              />
              <ButtonList
                id="csf_courses_planned"
                key="csf_courses_planned"
                answers={csfCourses}
                groupName="csf_courses_planned"
                label={coursesPlannedLabel}
                onChange={this.handleChange}
                selectedItems={this.state.csf_courses_planned}
                validationState={
                  this.state.errors.hasOwnProperty('csf_courses_planned')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorText={this.state.errors.csf_courses_planned}
                type="check"
              />
              <ButtonList
                id="attended_csf_intro_workshop"
                key="attended_csf_intro_workshop"
                answers={Object.keys(ATTENDED_CSF_COURSES_OPTIONS)}
                groupName="attended_csf_intro_workshop"
                label="Have you attended a CS Fundamentals Intro Workshop before?"
                onChange={this.handleChange}
                selectedItems={this.state.attended_csf_intro_workshop}
                validationState={
                  this.state.errors.hasOwnProperty(
                    'attended_csf_intro_workshop'
                  )
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorText={this.state.errors.attended_csf_intro_workshop}
                type="radio"
                required={true}
              />
              <ButtonList
                id="csf_has_physical_curriculum_guide"
                key="csf_has_physical_curriculum_guide"
                answers={Object.keys(CSF_HAS_CURIICULUM_COPY_OPTIONS)}
                groupName="csf_has_physical_curriculum_guide"
                label="Do you have a physical copy of the 2019-2020 CS Fundamentals Curriculum Guide that you can bring to the workshop?"
                onChange={this.handleChange}
                selectedItems={this.state.csf_has_physical_curriculum_guide}
                validationState={
                  this.state.errors.hasOwnProperty(
                    'csf_has_physical_curriculum_guide'
                  )
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorText={this.state.errors.csf_has_physical_curriculum_guide}
                type="radio"
                require={true}
              />
            </FormGroup>
          )}

        {this.props.collect_demographics && (
          <div>
            <ButtonList
              id="previous_courses"
              key="previous_courses"
              answers={previousCourses}
              groupName="previous_courses"
              label="Which computer science courses or activities have you taught in the past?"
              onChange={this.handleChange}
              selectedItems={this.state.previous_courses}
              validationState={
                this.state.errors.hasOwnProperty('previous_courses')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={this.state.errors.previous_courses}
              type="check"
              columnCount={2}
            />

            <ButtonList
              id="replace_existing"
              key="replace_existing"
              answers={REPLACE_EXISTING_OPTIONS}
              groupName="replace_existing"
              label="Will this course replace an existing computer science course in the master schedule?"
              onChange={this.handleChange}
              selectedItems={this.state.replace_existing}
              validationState={
                this.state.errors.hasOwnProperty('replace_existing')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={this.state.errors.replace_existing}
              type="radio"
              columnCount={1}
            />
          </div>
        )}

        {this.props.workshop_course === CSP &&
          this.props.workshop_subject ===
            SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS && (
            <div>
              <FieldGroup
                id="years_teaching"
                label="Years Teaching (overall)"
                type="number"
                required={true}
                onChange={this.handleChange}
                validationState={
                  this.state.errors.hasOwnProperty('years_teaching')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorMessage={this.state.errors.years_teaching}
              />
              <FieldGroup
                id="years_teaching_cs"
                label="Years Teaching Computer Science"
                type="number"
                required={true}
                onChange={this.handleChange}
                validationState={
                  this.state.errors.hasOwnProperty('years_teaching_cs')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorMessage={this.state.errors.years_teaching_cs}
              />
              <ButtonList
                groupName="taught_ap_before"
                type="radio"
                required
                label={cspReturningTeachersTaughtAPLabel}
                answers={cspReturningTeachersTaughtAPAnswers}
                onChange={this.handleChange}
                selectedItems={this.state.taught_ap_before}
                validationState={
                  this.state.errors.hasOwnProperty('taught_ap_before')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorText={this.state.errors.taught_ap_before}
                suppressLineBreak={true}
              />
              <ButtonList
                groupName="planning_to_teach_ap"
                type="radio"
                required
                label={cspReturningTeachersPlanningAPLabel}
                answers={cspReturningTeachersPlanningAPAnswers}
                onChange={this.handleChange}
                selectedItems={this.state.planning_to_teach_ap}
                validationState={
                  this.state.errors.hasOwnProperty('planning_to_teach_ap')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorText={this.state.errors.planning_to_teach_ap}
                suppressLineBreak={true}
              />
            </div>
          )}

        <p>
          Code.org works closely with local Regional Partners and Code.org
          facilitators to deliver the Professional Learning Program. By
          enrolling in this workshop, you are agreeing to allow Code.org to
          share information on how you use Code.org and the Professional
          Learning resources with your Regional Partner, school district and
          facilitators. We will share your contact information, which
          courses/units you are using and aggregate data about your classes with
          these partners. This includes the number of students in your classes,
          the demographic breakdown of your classroom, and the name of your
          school and district. We will not share any information about
          individual students with our partners - all information will be
          de-identified and aggregated. Our Regional Partners and facilitators
          are contractually obliged to treat this information with the same
          level of confidentiality as Code.org.
        </p>
        <Button
          id="submit"
          onClick={this.handleClickRegister}
          disabled={this.state.isSubmitting}
        >
          Register
        </Button>
        <br />
        <br />
        <br />
        <br />
      </form>
    );
  }

  getMissingRequiredFields() {
    const requiredFields = ['first_name', 'last_name', 'email'];

    if (!this.props.email) {
      requiredFields.push('confirm_email');
    }

    if (this.props.workshop_course === CSF) {
      requiredFields.push('role', 'grades_teaching');
      if (this.props.workshop_subject === INTRO) {
        requiredFields.push('csf_intro_intent');
      } else if (this.props.workshop_subject === DEEP_DIVE) {
        requiredFields.push(
          'attended_csf_intro_workshop',
          'csf_has_physical_curriculum_guide'
        );
      }
    }

    if (
      this.props.workshop_course === CSP &&
      this.props.workshop_subject ===
        SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS
    ) {
      requiredFields.push(
        'years_teaching',
        'years_teaching_cs',
        'taught_ap_before',
        'planning_to_teach_ap'
      );
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
        errors.email = 'Must be a valid email address';
      }
      if (!this.props.email && this.state.email !== this.state.confirm_email) {
        errors.confirm_email = 'Email addresses do not match';
      }
    }

    return errors;
  }
}
