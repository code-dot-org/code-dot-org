/*
 * Form to create a workshop enrollment
 */
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {
  FormGroup,
  Button,
  ControlLabel,
  HelpBlock,
  Alert,
} from 'react-bootstrap';
import Select from 'react-select';

import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import color from '@cdo/apps/util/color';
import {isEmail} from '@cdo/apps/util/formatValidation';

import SchoolAutocompleteDropdownWithCustomFields from '../components/schoolAutocompleteDropdownWithCustomFields';
import {ButtonList} from '../form_components/ButtonList.jsx';
import FieldGroup from '../form_components/FieldGroup';
import QuestionsTable from '../form_components/QuestionsTable';

const OTHER = 'Other';
const NOT_TEACHING = "I'm not teaching this year";
const EXPLAIN = '(Please Explain):';

const CSF = 'CS Fundamentals';
const INTRO = SubjectNames.SUBJECT_CSF_101;
const DISTRICT = SubjectNames.SUBJECT_CSF_DISTRICT;
const DEEP_DIVE = SubjectNames.SUBJECT_CSF_201;

const CSP = 'CS Principles';
const ADMIN_COUNSELOR = 'Admin/Counselor Workshop';

const VALIDATION_STATE_ERROR = 'error';

const SCHOOL_TYPES_MAPPING = {
  'Public school': 'public',
  'Private school': 'private',
  'Charter school': 'charter',
  Other: 'other',
};

const DESCRIBE_ROLES = [
  'School Administrator',
  'District Administrator',
  'Parent',
  'Other',
];

const CSF_ROLES = [
  'Classroom Teacher',
  'Media Specialist',
  'Tech Teacher',
  'Librarian',
].concat(DESCRIBE_ROLES);

const ADMIN_COUNSELOR_ROLES = ['Administrator', 'Counselor', 'Other'];

const GRADES_TEACHING = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6-8',
  'Grade 9-12',
];

const CSF_COURSES = {
  courseA: 'Course A',
  courseB: 'Course B',
  courseC: 'Course C',
  courseD: 'Course D',
  courseE: 'Course E',
  courseF: 'Course F',
  express: 'Express',
  courses14_accelerated: 'Courses 1-4 or Accelerated',
};

const ATTENDED_CSF_COURSES_OPTIONS = {
  'Yes, I attended a CS Fundamentals Intro workshop this academic year.':
    'Yes, this year',
  'Yes, I attended a CS Fundamentals Intro workshop in a previous academic year.':
    'Yes, prior year',
  'Nope, I have never attended a CS Fundamentals workshop.': 'No',
};

function EnrollForm(props) {
  const [formState, setFormState] = useState({
    first_name: props.first_name,
    last_name: props.last_name,
    email: props.email,
    describe_role: props.describe_role,
    explain_teaching_other: props.explain_teaching_other,
    explain_not_teaching: props.explain_not_teaching,
    csf_course_experience: props.csf_course_experience,
    explain_csf_course_other: props.explain_csf_course_other,
    attended_csf_intro_workshop: props.attended_csf_intro_workshop,
    previous_courses: props.previous_courses,
    csf_intro_intent: props.csf_intro_intent,
    csf_intro_other_factors: props.csf_intro_other_factors,
    years_teaching: props.years_teaching,
    years_teaching_cs: props.years_teaching_cs,
    taught_ap_before: props.taught_ap_before,
    planning_to_teach_ap: props.planning_to_teach_ap,
    grades_teaching: props.grades_teaching,
    role: props.role,
  });

  const [schoolInfoState, setSchoolInfoState] = useState({
    school_id: props.school_info?.school_id,
    school_district_name: props.school_info?.school_district_name,
    school_district_other: props.school_info?.school_district_other,
    school_name: props.school_info?.school_name,
    school_state: props.school_info?.school_state,
    school_zip: props.school_info?.school_zip,
    school_type: props.school_info?.school_type,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');

  const handleChange = change => {
    setFormState(prevState => ({
      ...prevState,
      ...change,
    }));
  };

  const onSchoolInfoChange = ({school_info}) => {
    setSchoolInfoState(school_info);
  };

  const handleRoleChange = selection => {
    handleChange({role: selection.value});
  };

  const handleNotTeachingChange = input => {
    handleChange({explain_not_teaching: input});
  };

  const handleTeachingOtherChange = input => {
    handleChange({explain_teaching_other: input});
  };

  const handleCsfCourseOtherChange = input => {
    handleChange({explain_csf_course_other: input});
  };

  const handleCsfCourseExperienceChange = input => {
    let exp;
    if (formState.csf_course_experience) {
      exp = formState.csf_course_experience;
    } else {
      exp = {};
    }
    Object.keys(input).map(key => (exp[CSF_COURSES[key]] = input[key]));
    handleChange({csf_course_experience: exp});
  };

  const handleClickRegister = () => {
    const errors = getRequiredFieldErrors();
    setFormErrors(errors);
    if (!Object.keys(errors).length) {
      submit();
    }
  };

  const getRole = () => {
    if (!formState.role) {
      return null;
    }
    let roleWithDescription = '';
    if (formState.describe_role) {
      roleWithDescription = `${formState.role}: ${formState.describe_role}`;
    } else {
      roleWithDescription = formState.role;
    }
    return roleWithDescription;
  };

  const getCsfCoursesPlanned = () => {
    if (!formState.csf_courses_planned) {
      return undefined;
    }
    const processedCourses = [];
    formState.csf_courses_planned.forEach(course => {
      if (course === `${OTHER} ${EXPLAIN}`) {
        if (formState.explain_csf_course_other) {
          processedCourses.push(
            `${OTHER}: ${formState.explain_csf_course_other}`
          );
        } else {
          processedCourses.push(OTHER);
        }
      } else {
        processedCourses.push(course);
      }
    });
    return processedCourses;
  };

  const getGradesTeaching = () => {
    if (!formState.grades_teaching) {
      return null;
    }
    const processedGrades = [];
    formState.grades_teaching.forEach(grade => {
      if (grade === `${OTHER} ${EXPLAIN}`) {
        if (formState.explain_teaching_other) {
          processedGrades.push(`${OTHER}: ${formState.explain_teaching_other}`);
        } else {
          processedGrades.push(OTHER);
        }
      } else if (grade === `${NOT_TEACHING} ${EXPLAIN}`) {
        if (formState.explain_not_teaching) {
          processedGrades.push(
            `${NOT_TEACHING}: ${formState.explain_not_teaching}`
          );
        } else {
          processedGrades.push(NOT_TEACHING);
        }
      } else {
        processedGrades.push(grade);
      }
    });
    return processedGrades;
  };

  const getSchoolType = () => {
    if (!schoolInfoState.school_id) {
      return SCHOOL_TYPES_MAPPING[schoolInfoState.school_type];
    } else {
      return schoolInfoState.school_type;
    }
  };

  const submit = () => {
    setFormErrors({});
    setSubmissionErrorMessage('');
    setIsSubmitting(true);
    let schoolInfo = {};
    if (schoolInfoState.school_id) {
      schoolInfo = {school_id: schoolInfoState.school_id};
    } else {
      schoolInfo = {
        school_district_name: schoolInfoState.school_district_name,
        school_district_other: schoolInfoState.school_district_other,
        school_name: schoolInfoState.school_name,
        school_state: schoolInfoState.school_state,
        school_zip: schoolInfoState.school_zip,
        school_type: getSchoolType(),
      };
    }
    const params = {
      user_id: props.user_id,
      first_name: formState.first_name,
      last_name: formState.last_name,
      email: formState.email,
      school_info: schoolInfo,
      role: getRole(),
      describe_role: formState.describe_role,
      grades_teaching: getGradesTeaching(),
      explain_teaching_other: formState.explain_teaching_other,
      explain_not_teaching: formState.explain_not_teaching,
      csf_course_experience: formState.csf_course_experience,
      csf_courses_planned: getCsfCoursesPlanned(),
      explain_csf_course_other: formState.explain_csf_course_other,
      attended_csf_intro_workshop:
        ATTENDED_CSF_COURSES_OPTIONS[formState.attended_csf_intro_workshop],
      previous_courses: formState.previous_courses,
      csf_intro_intent: formState.csf_intro_intent,
      csf_intro_other_factors: formState.csf_intro_other_factors,
      years_teaching: formState.years_teaching,
      years_teaching_cs: formState.years_teaching_cs,
      taught_ap_before: formState.taught_ap_before,
      planning_to_teach_ap: formState.planning_to_teach_ap,
    };
    $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${props.workshop_id}/enrollments`,
      contentType: 'application/json',
      data: JSON.stringify(params),
      complete: result => {
        setIsSubmitting(false);
        result?.responseJSON?.workshop_enrollment_status === 'error' &&
          setSubmissionErrorMessage(
            result?.responseJSON?.error_message || 'unknown error'
          );
        props.onSubmissionComplete(result);
      },
    });
  };

  const getRequiredFieldErrors = () => {
    let errors = getErrors();
    const missingRequiredFields = getMissingRequiredFields();
    const schoolInfoErrors =
      SchoolAutocompleteDropdownWithCustomFields.validate(schoolInfoState);

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
    }
    return errors;
  };

  const getMissingRequiredFields = () => {
    const requiredFields = ['first_name', 'last_name', 'email'];

    if (!props.email) {
      requiredFields.push('confirm_email');
    }

    if (props.workshop_course === CSF) {
      requiredFields.push('role', 'grades_teaching');
      if (
        props.workshop_subject === INTRO ||
        props.workshop_subject === DISTRICT
      ) {
        requiredFields.push('csf_intro_intent');
      } else if (props.workshop_subject === DEEP_DIVE) {
        requiredFields.push('attended_csf_intro_workshop');
      }
    }

    if (
      props.workshop_course === CSP &&
      props.workshop_subject === SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS
    ) {
      requiredFields.push(
        'years_teaching',
        'years_teaching_cs',
        'taught_ap_before',
        'planning_to_teach_ap'
      );
    }

    const missingRequiredFields = requiredFields.filter(field => {
      return !formState[field];
    });

    return missingRequiredFields;
  };

  const getErrors = () => {
    const errors = {};

    if (formState.email) {
      if (!isEmail(formState.email)) {
        errors.email = 'Must be a valid email address';
      }
      if (!props.email && formState.email !== formState.confirm_email) {
        errors.confirm_email = 'Email addresses do not match';
      }
    }

    return errors;
  };

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
      <strong>use more of</strong> in the next 12 months? Check all that apply.
    </div>
  );
  const gradesTeaching = GRADES_TEACHING.concat([
    {
      answerText: `${NOT_TEACHING} ${EXPLAIN}`,
      inputValue: formState.explain_not_teaching,
      onInputChange: handleNotTeachingChange,
    },
    {
      answerText: `${OTHER} ${EXPLAIN}`,
      inputValue: formState.explain_teaching_other,
      onInputChange: handleTeachingOtherChange,
    },
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
    'I am here to bring information back to my school or district.',
  ];

  const cspReturningTeachersTaughtAPLabel = `Have you taught an Advanced Placement (AP) course before?`;
  const cspReturningTeachersTaughtAPAnswers = [
    'Yes, AP CS Principles or AP CS A',
    'Yes, but in another subject',
    'No',
  ];

  const cspReturningTeachersPlanningAPLabel = `Are you planning to teach CS Principles as an AP course?`;
  const cspReturningTeachersPlanningAPAnswers = [
    'Yes',
    'No',
    'Both AP and non-AP',
    'Unsure / Still deciding',
  ];

  const csfCourses = Object.keys(CSF_COURSES)
    .filter(key => key !== 'courses14_accelerated')
    .map(key => CSF_COURSES[key])
    .concat([
      {
        answerText: `${OTHER} ${EXPLAIN}`,
        inputValue: formState.explain_csf_course_other,
        onInputChange: handleCsfCourseOtherChange,
      },
    ]);
  const previousCourses = props.previous_courses.concat([
    "I don't have experience teaching any of these courses",
  ]);

  const roles =
    (props.workshop_course === CSF && CSF_ROLES) ||
    (props.workshop_course === ADMIN_COUNSELOR && ADMIN_COUNSELOR_ROLES);

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
          onChange={handleChange}
          defaultValue={props.first_name}
          validationState={
            Object.prototype.hasOwnProperty.call(formErrors, 'first_name')
              ? VALIDATION_STATE_ERROR
              : null
          }
          errorMessage={formErrors.first_name}
        />
        <FieldGroup
          id="last_name"
          label="Last Name"
          type="text"
          required={true}
          onChange={handleChange}
          validationState={
            Object.prototype.hasOwnProperty.call(formErrors, 'last_name')
              ? VALIDATION_STATE_ERROR
              : null
          }
          errorMessage={formErrors.last_name}
        />
        <FieldGroup
          id="email"
          label="Email Address"
          type="text"
          required={true}
          onChange={handleChange}
          defaultValue={props.email}
          title={props.email ? 'Email can be changed in account settings' : ''}
          validationState={
            Object.prototype.hasOwnProperty.call(formErrors, 'email')
              ? VALIDATION_STATE_ERROR
              : null
          }
          errorMessage={formErrors.email}
        />
        {!props.email && (
          <FieldGroup
            id="confirm_email"
            label="Confirm Email Address"
            type="text"
            required={true}
            onChange={handleChange}
            validationState={
              Object.prototype.hasOwnProperty.call(formErrors, 'confirm_email')
                ? VALIDATION_STATE_ERROR
                : null
            }
            errorMessage={formErrors.confirm_email}
          />
        )}
      </FormGroup>
      <SchoolAutocompleteDropdownWithCustomFields
        onSchoolInfoChange={onSchoolInfoChange}
        school_info={schoolInfoState}
        errors={formErrors}
      />
      {(props.workshop_course === CSF ||
        props.workshop_course === ADMIN_COUNSELOR) && (
        <FormGroup>
          <FormGroup
            validationState={
              Object.prototype.hasOwnProperty.call(formErrors, 'role')
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
              value={formState.role}
              onChange={handleRoleChange}
              options={roles.map(r => ({value: r, label: r}))}
              validationState={
                Object.prototype.hasOwnProperty.call(formErrors, 'role')
                  ? VALIDATION_STATE_ERROR
                  : null
              }
            />
            <HelpBlock>{formErrors.role}</HelpBlock>
            {DESCRIBE_ROLES.includes(formState.role) && (
              <FieldGroup
                id="describe_role"
                label="Please describe your role"
                type="text"
                onChange={handleChange}
              />
            )}
          </FormGroup>
          {props.workshop_course !== ADMIN_COUNSELOR && (
            <ButtonList
              id="grades_teaching"
              answers={gradesTeaching}
              groupName="grades_teaching"
              label={gradesLabel}
              onChange={handleChange}
              selectedItems={formState.grades_teaching}
              validationState={
                Object.prototype.hasOwnProperty.call(
                  formErrors,
                  'grades_teaching'
                )
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={formErrors.grades_teaching}
              type="check"
            />
          )}
        </FormGroup>
      )}
      {props.workshop_course === CSF &&
        (props.workshop_subject === INTRO ||
          props.workshop_subject === DISTRICT) && (
          <ButtonList
            id="csf_intro_intent"
            groupName="csf_intro_intent"
            type="radio"
            required
            label={csfIntroIntentLabel}
            answers={csfIntroIntentAnswers}
            onChange={handleChange}
            selectedItems={formState.csf_intro_intent}
            validationState={
              Object.prototype.hasOwnProperty.call(
                formErrors,
                'csf_intro_intent'
              )
                ? VALIDATION_STATE_ERROR
                : null
            }
            errorText={formErrors.csf_intro_intent}
          />
        )}
      {props.workshop_course === CSF &&
        (props.workshop_subject === INTRO ||
          props.workshop_subject === DISTRICT) && (
          <ButtonList
            id="csf_intro_other_factors"
            groupName="csf_intro_other_factors"
            type="check"
            label={csfIntroOtherFactorsLabel}
            answers={csfIntroOtherFactorsAnswers}
            onChange={handleChange}
            selectedItems={formState.csf_intro_other_factors}
            validationState={
              Object.prototype.hasOwnProperty.call(
                formErrors,
                'csf_intro_other_factors'
              )
                ? VALIDATION_STATE_ERROR
                : null
            }
            errorText={formErrors.csf_intro_other_factors}
          />
        )}
      {props.workshop_course === CSF &&
        props.workshop_subject === DEEP_DIVE && (
          <FormGroup>
            <QuestionsTable
              id="csf_course_experience"
              label="This workshop is designed for educators that have experience teaching CS Fundamentals. During the past year, how have you used CS Fundamentals course(s) with students?"
              onChange={handleCsfCourseExperienceChange}
              options={['none', 'a few lessons', 'most lessons', 'all lessons']}
              questions={Object.keys(CSF_COURSES).map(key => ({
                label: CSF_COURSES[key],
                name: key,
              }))}
              selectedItems={formState.csf_course_experience}
            />
            <ButtonList
              id="csf_courses_planned"
              answers={csfCourses}
              groupName="csf_courses_planned"
              label={coursesPlannedLabel}
              onChange={handleChange}
              selectedItems={formState.csf_courses_planned}
              validationState={
                Object.prototype.hasOwnProperty.call(
                  formErrors,
                  'csf_courses_planned'
                )
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={formErrors.csf_courses_planned}
              type="check"
            />
            <ButtonList
              id="attended_csf_intro_workshop"
              answers={Object.keys(ATTENDED_CSF_COURSES_OPTIONS)}
              groupName="attended_csf_intro_workshop"
              label="Have you attended a CS Fundamentals Intro Workshop before?"
              onChange={handleChange}
              selectedItems={formState.attended_csf_intro_workshop}
              validationState={
                Object.prototype.hasOwnProperty.call(
                  formErrors,
                  'attended_csf_intro_workshop'
                )
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={formErrors.attended_csf_intro_workshop}
              type="radio"
              required={true}
            />
          </FormGroup>
        )}

      {props.collect_demographics && (
        <div>
          <ButtonList
            id="previous_courses"
            answers={previousCourses}
            groupName="previous_courses"
            label="Which computer science courses or activities have you taught in the past?"
            onChange={handleChange}
            selectedItems={formState.previous_courses}
            validationState={
              Object.prototype.hasOwnProperty.call(
                formErrors,
                'previous_courses'
              )
                ? VALIDATION_STATE_ERROR
                : null
            }
            errorText={formErrors.previous_courses}
            type="check"
            columnCount={2}
          />
        </div>
      )}

      {props.workshop_course === CSP &&
        props.workshop_subject ===
          SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS && (
          <div>
            <FieldGroup
              id="years_teaching"
              label="Years Teaching (overall)"
              type="number"
              required={true}
              onChange={handleChange}
              validationState={
                Object.prototype.hasOwnProperty.call(
                  formErrors,
                  'years_teaching'
                )
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorMessage={formErrors.years_teaching}
            />
            <FieldGroup
              id="years_teaching_cs"
              label="Years Teaching Computer Science"
              type="number"
              required={true}
              onChange={handleChange}
              validationState={
                Object.prototype.hasOwnProperty.call(
                  formErrors,
                  'years_teaching_cs'
                )
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorMessage={formErrors.years_teaching_cs}
            />
            <ButtonList
              id="taught_ap_before"
              groupName="taught_ap_before"
              type="radio"
              required
              label={cspReturningTeachersTaughtAPLabel}
              answers={cspReturningTeachersTaughtAPAnswers}
              onChange={handleChange}
              selectedItems={formState.taught_ap_before}
              validationState={
                Object.prototype.hasOwnProperty.call(
                  formErrors,
                  'taught_ap_before'
                )
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={formErrors.taught_ap_before}
              suppressLineBreak={true}
            />
            <ButtonList
              id="planning_to_teach_ap"
              groupName="planning_to_teach_ap"
              type="radio"
              required
              label={cspReturningTeachersPlanningAPLabel}
              answers={cspReturningTeachersPlanningAPAnswers}
              onChange={handleChange}
              selectedItems={formState.planning_to_teach_ap}
              validationState={
                Object.prototype.hasOwnProperty.call(
                  formErrors,
                  'planning_to_teach_ap'
                )
                  ? VALIDATION_STATE_ERROR
                  : null
              }
              errorText={formErrors.planning_to_teach_ap}
              suppressLineBreak={true}
            />
          </div>
        )}

      <p>
        Code.org works closely with local Regional Partners and Code.org
        facilitators to deliver the Professional Learning Program. By enrolling
        in this workshop, you are agreeing to allow Code.org to share
        information on how you use Code.org and the Professional Learning
        resources with your Regional Partner, school district and facilitators.
        We will share your contact information, which courses/units you are
        using and aggregate data about your classes with these partners. This
        includes the number of students in your classes, the demographic
        breakdown of your classroom, and the name of your school and district.
        We will not share any information about individual students with our
        partners - all information will be de-identified and aggregated. Our
        Regional Partners and facilitators are contractually obliged to treat
        this information with the same level of confidentiality as Code.org.
      </p>
      <Button id="submit" onClick={handleClickRegister} disabled={isSubmitting}>
        Register
      </Button>
      {Object.keys(formErrors).length > 0 && (
        <p style={{color: color.bootstrap_v3_error_text}}>
          Form errors found. Please check your responses above.
        </p>
      )}
      {submissionErrorMessage && (
        <Alert bsStyle="danger" style={{marginTop: 10}}>
          <p>
            Sorry, we were unable to enroll you in this workshop because
            {' ' + submissionErrorMessage}. Please double check your responses,
            and if the problem persists, contact{' '}
            <a href="mailto:support@code.org">support@code.org</a>.
          </p>
        </Alert>
      )}
      <br />
      <br />
      <br />
      <br />
    </form>
  );
}

EnrollForm.propTypes = {
  attended_csf_intro_workshop: PropTypes.string,
  collect_demographics: PropTypes.bool,
  csf_course_experience: PropTypes.string,
  csf_intro_intent: PropTypes.string,
  csf_intro_other_factors: PropTypes.string,
  describe_role: PropTypes.string,
  email: PropTypes.string,
  explain_csf_course_other: PropTypes.string,
  explain_not_teaching: PropTypes.string,
  explain_teaching_other: PropTypes.string,
  first_name: PropTypes.string,
  grades_teaching: PropTypes.string,
  last_name: PropTypes.string,
  onSubmissionComplete: PropTypes.func,
  planning_to_teach_ap: PropTypes.string,
  previous_courses: PropTypes.arrayOf(PropTypes.string).isRequired,
  role: PropTypes.string,
  taught_ap_before: PropTypes.string,
  user_id: PropTypes.number.isRequired,
  workshop_course: PropTypes.string,
  workshop_id: PropTypes.number.isRequired,
  workshop_subject: PropTypes.string,
  years_teaching: PropTypes.string,
  years_teaching_cs: PropTypes.string,
  school_info: PropTypes.shape({
    school_id: PropTypes.string,
    school_district_name: PropTypes.string,
    school_district_other: PropTypes.string,
    school_name: PropTypes.string,
    school_state: PropTypes.string,
    school_zip: PropTypes.string,
    school_type: PropTypes.string,
  }),
};

export default EnrollForm;
