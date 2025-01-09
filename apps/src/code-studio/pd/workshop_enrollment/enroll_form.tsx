/*
 * Form to create a workshop enrollment
 */
import classNames from 'classnames';
import React, {Fragment, ReactNode, useMemo, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert';
import {Button} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import RadioButtonsGroup from '@cdo/apps/componentLibrary/radioButton/RadioButtonsGroup';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {buildSchoolData} from '@cdo/apps/schoolInfo/utils/buildSchoolData';
import {schoolInfoInvalid} from '@cdo/apps/schoolInfo/utils/schoolInfoInvalid';
import SchoolDataInputs, {
  SCHOOL_INFO_ID,
} from '@cdo/apps/templates/SchoolDataInputs.jsx';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {isEmail} from '@cdo/apps/util/formatValidation';

import QuestionsTable from '../form_components/QuestionsTable';
import {COURSE_BUILD_YOUR_OWN} from '../workshop_dashboard/workshopConstants';

import {
  ADMIN_COUNSELOR,
  ADMIN_COUNSELOR_ROLES,
  ATTENDED_CSF_COURSES_OPTIONS,
  CSF,
  CSF_COURSES,
  CSF_ROLES,
  CSP,
  DEEP_DIVE,
  DESCRIBE_ROLES,
  DISTRICT,
  EXPLAIN,
  GRADES_TEACHING,
  INTRO,
  NOT_TEACHING,
  OTHER,
  SUBMISSION_STATUSES,
} from './constants';

import styles from '@cdo/apps/code-studio/pd/workshop_enrollment/EnrollForm/styles.module.scss';
import textFieldStyles from '@cdo/apps/componentLibrary/textField/textfield.module.scss';

interface SchoolInfoProps {
  country?: string;
  school_id?: string;
  school_name?: string;
  school_type?: string;
  school_zip?: string;
}

interface EnrollFormState {
  attended_csf_intro_workshop: keyof typeof ATTENDED_CSF_COURSES_OPTIONS;
  confirm_email: string;
  csf_course_experience: Partial<typeof CSF_COURSES>;
  csf_courses_planned: string[];
  csf_intro_intent: string;
  csf_intro_other_factors: string[];
  describe_role: string;
  email: string;
  explain_csf_course_other: string;
  explain_not_teaching: string;
  explain_teaching_other: string;
  first_name: string;
  grades_teaching: string[];
  last_name: string;
  planning_to_teach_ap: string;
  previous_courses: string[];
  role: string;
  taught_ap_before: string;
  years_teaching: string;
  years_teaching_cs: string;
}

type CombinedFormState = keyof EnrollFormState | 'school_info';

type FormErrors = Partial<Record<CombinedFormState, string>>;

type EnrollmentResponse = {
  account_exists: boolean;
  cancel_url: string;
  sign_up_url: string;
  workshop_enrollment_status: string;
};

/**
 * not all props are passed down from the parent WorkshopEnroll component
 * but they are used in unit tests to set initial state
 */
type EnrollFormProps = {
  collect_demographics?: boolean;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  onSubmissionComplete: (response?: EnrollmentResponse) => void;
  previous_courses: string[];
  school_info?: SchoolInfoProps;
  user_id: number;
  workshop_course?: string;
  workshop_id: number;
  workshop_subject?: string;
  grades_teaching?: string[];
  csf_intro_intent?: string;
  attended_csf_intro_workshop?: string;
  years_teaching?: string;
  years_teaching_cs?: string;
  taught_ap_before?: string;
  planning_to_teach_ap?: string;
};

/**
 * This Label component is necessary to apply the same label and
 * error message elements that TextField DSCO component has to other
 * inputs that don't yet have a label or error message prop, such
 * as textarea, RadioButtonsGroup, and Checkbox.
 */
const Label = ({
  children,
  text,
  htmlFor,
  errorMessage,
  className = '',
}: {
  children?: ReactNode;
  text?: ReactNode;
  htmlFor?: string;
  errorMessage?: ReactNode;
  className?: string;
}) => (
  <label
    className={classNames(
      textFieldStyles.textField,
      textFieldStyles['textField-black'],
      textFieldStyles['textField-m'],
      className
    )}
    htmlFor={htmlFor}
  >
    {text && <span className={textFieldStyles.textFieldLabel}>{text}</span>}
    {children}
    {errorMessage && (
      <div
        className={classNames(
          textFieldStyles.textFieldHelperSection,
          textFieldStyles.textFieldErrorSection
        )}
      >
        <FontAwesomeV6Icon iconName={'circle-exclamation'} />
        <span>{errorMessage}</span>
      </div>
    )}
  </label>
);

export default function EnrollForm(props: EnrollFormProps) {
  const roles = useMemo(() => {
    switch (props.workshop_course) {
      case CSF:
        return CSF_ROLES;
      case ADMIN_COUNSELOR:
        return ADMIN_COUNSELOR_ROLES;
      default:
        return [];
    }
  }, [props.workshop_course]);

  const [formState, setFormState] = useState<EnrollFormState>({
    attended_csf_intro_workshop: props.attended_csf_intro_workshop ?? '',
    confirm_email: '',
    csf_course_experience: {},
    csf_courses_planned: [],
    csf_intro_intent: props.csf_intro_intent ?? '',
    csf_intro_other_factors: [],
    describe_role: '',
    email: props.email ?? '',
    explain_csf_course_other: '',
    explain_not_teaching: '',
    explain_teaching_other: '',
    first_name: props.first_name ?? '',
    grades_teaching: props.grades_teaching ?? [],
    last_name: props.last_name ?? '',
    planning_to_teach_ap: props.planning_to_teach_ap ?? '',
    previous_courses: [],
    role: props.role ?? '',
    taught_ap_before: props.taught_ap_before ?? '',
    years_teaching: props.years_teaching ?? '',
    years_teaching_cs: props.years_teaching_cs ?? '',
  });

  const schoolInfo = useSchoolInfo({
    schoolId: props.school_info?.school_id,
    country: props.school_info?.country,
    schoolName: props.school_info?.school_name,
    schoolZip: props.school_info?.school_zip,
    schoolType: props.school_info?.school_type,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');

  const handleChange = (change: Partial<EnrollFormState>) => {
    setFormState(prevState => ({
      ...prevState,
      ...change,
    }));
  };

  const handleRoleChange = (selection: string | undefined) => {
    handleChange({role: selection});
  };

  const handleChecked = (
    key: keyof Pick<
      EnrollFormState,
      | 'grades_teaching'
      | 'previous_courses'
      | 'csf_intro_other_factors'
      | 'csf_courses_planned'
    >,
    value: string,
    checked: boolean
  ) => {
    const selected = new Set(formState[key]);
    if (checked) {
      selected.add(value);
    } else {
      selected.delete(value);
    }
    handleChange({
      [key]: Array.from(selected),
    });
  };

  const handleCsfCourseExperienceChange = (
    input: Partial<typeof CSF_COURSES>
  ) => {
    handleChange({
      csf_course_experience: {
        ...formState.csf_course_experience,
        ...input,
      },
    });
  };

  const handleClickRegister = () => {
    if (props.workshop_course === COURSE_BUILD_YOUR_OWN) {
      submit();
    } else {
      const errors = updateErrors();
      if (!Object.keys(errors).length) {
        submit();
      }
    }
  };

  const updateErrors = () => {
    const errors = getAllErrors();
    setFormErrors(errors);
    return errors;
  };

  const getRole = () => {
    if (!formState.role) {
      return null;
    }
    let roleWithDescription = formState.role;
    if (formState.describe_role) {
      roleWithDescription += `: ${formState.describe_role}`;
    }
    return roleWithDescription;
  };

  const getCsfCoursesPlanned = () => {
    if (!formState.csf_courses_planned) {
      return undefined;
    }
    const processedCourses: string[] = [];
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
    const processedGrades: string[] = [];
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

  const submit = async () => {
    setFormErrors({});
    setSubmissionErrorMessage('');
    setIsSubmitting(true);

    const params = {
      user_id: props.user_id,
      first_name: formState.first_name,
      last_name: formState.last_name,
      email: formState.email,
      school_info: buildSchoolData({
        schoolId: schoolInfo.schoolId,
        country: schoolInfo.country,
        schoolName: schoolInfo.schoolName,
        schoolZip: schoolInfo.schoolZip,
      }),
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

    try {
      const response = await fetch(
        `/api/v1/pd/workshops/${props.workshop_id}/enrollments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
          body: JSON.stringify(params),
        }
      );
      setIsSubmitting(false);
      const result = await response.json();
      if (
        result.workshop_enrollment_status === SUBMISSION_STATUSES.UNKNOWN_ERROR
      ) {
        setSubmissionErrorMessage(
          result.error_message || 'Unknown error occurred'
        );
      }
      props.onSubmissionComplete(result);
    } catch (error) {
      setIsSubmitting(false);
      setSubmissionErrorMessage('Unknown error occurred');
    }
  };

  const getAllErrors = () => {
    const errors: FormErrors = {};

    if (formState.email) {
      if (!isEmail(formState.email)) {
        errors.email = 'Must be a valid email address';
      }
      if (!props.email && formState.email !== formState.confirm_email) {
        errors.confirm_email = 'Email addresses do not match';
      }
    }

    if (
      schoolInfoInvalid({
        country: schoolInfo.country,
        schoolName: schoolInfo.schoolName,
        schoolZip: schoolInfo.schoolZip,
        schoolId: schoolInfo.schoolId,
        schoolsList: schoolInfo.schoolsList,
      })
    ) {
      errors.school_info = 'School information is required';
    }

    const missingRequiredFields = requiredFields.filter(
      field =>
        !formState[field] ||
        (Array.isArray(formState[field]) && formState[field].length === 0)
    );
    if (missingRequiredFields.length) {
      missingRequiredFields.forEach(f => {
        errors[f] = 'Field is required';
      });
    }

    return errors;
  };

  const requiredFields: Array<keyof EnrollFormState> = useMemo(() => {
    const fields: Array<keyof EnrollFormState> = [
      'first_name',
      'last_name',
      'email',
    ];

    if (!props.email) {
      fields.push('confirm_email');
    }

    if (props.workshop_course === CSF) {
      fields.push('role', 'grades_teaching');

      const gradesTeachingExplainKeys: Array<
        [keyof EnrollFormState, value: string]
      > = [
        ['explain_not_teaching', NOT_TEACHING],
        ['explain_teaching_other', OTHER],
      ];

      const relevantFormState: Partial<EnrollFormState> = {
        explain_not_teaching: formState.explain_not_teaching,
        explain_teaching_other: formState.explain_teaching_other,
      };

      gradesTeachingExplainKeys.forEach(([key, value]) => {
        if (
          formState.grades_teaching.some(option => option.includes(value)) &&
          !relevantFormState[key]
        ) {
          fields.push(key);
        }
      });

      if (
        props.workshop_subject === INTRO ||
        props.workshop_subject === DISTRICT
      ) {
        fields.push('csf_intro_intent');
      } else if (props.workshop_subject === DEEP_DIVE) {
        fields.push('attended_csf_intro_workshop');
      }
    }

    if (
      props.workshop_course === CSP &&
      props.workshop_subject === SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS
    ) {
      fields.push(
        'years_teaching',
        'years_teaching_cs',
        'taught_ap_before',
        'planning_to_teach_ap'
      );
    }

    return fields;
  }, [
    formState.grades_teaching,
    formState.explain_teaching_other,
    formState.explain_not_teaching,
    props.email,
    props.workshop_course,
    props.workshop_subject,
  ]);

  const getRequiredStyles = (key: keyof EnrollFormState) =>
    requiredFields.includes(key) ? styles.required : undefined;

  const coursesPlannedLabel = (
    <div>
      Which CS Fundamentals course(s), if any, do you plan to{' '}
      <strong>use more of</strong> in the next 12 months? Check all that apply.
    </div>
  );
  const gradesTeaching = [
    ...GRADES_TEACHING,
    `${NOT_TEACHING} ${EXPLAIN}`,
    `${OTHER} ${EXPLAIN}`,
  ];

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

  const csfCourses = [
    ...Object.values(CSF_COURSES).filter(
      value => CSF_COURSES.courses14_accelerated !== value
    ),
    `${OTHER} ${EXPLAIN}`,
  ];
  const previousCourses = props.previous_courses.concat([
    "I don't have experience teaching any of these courses",
  ]);

  return (
    <form id={styles.enroll_form}>
      {props.workshop_course !== COURSE_BUILD_YOUR_OWN && (
        <>
          <Typography
            semanticTag="p"
            visualAppearance="body-three"
            className={styles.no_margin}
          >
            Fields marked with a<span className="form-required-field"> * </span>
            are required.
          </Typography>
          <TextField
            id="first_name"
            name="first_name"
            label="First Name"
            onChange={e =>
              handleChange({
                first_name: e.target.value,
              })
            }
            value={formState.first_name}
            errorMessage={formErrors.first_name}
            className={getRequiredStyles('first_name')}
          />
          <TextField
            id="last_name"
            name="last_name"
            label="Last Name"
            onChange={e =>
              handleChange({
                last_name: e.target.value,
              })
            }
            value={formState.last_name}
            errorMessage={formErrors.last_name}
            className={getRequiredStyles('last_name')}
          />
          <TextField
            id="email"
            name="email"
            label="Email Address"
            onChange={e =>
              handleChange({
                email: e.target.value,
              })
            }
            value={formState.email}
            title={
              props.email ? 'Email can be changed in account settings' : ''
            }
            errorMessage={formErrors.email}
            className={getRequiredStyles('email')}
          />
          {!props.email && (
            <TextField
              id="confirm_email"
              name="confirm_email"
              label="Confirm Email Address"
              onChange={e =>
                handleChange({
                  confirm_email: e.target.value,
                })
              }
              value={formState.confirm_email}
              errorMessage={formErrors.confirm_email}
              className={getRequiredStyles('confirm_email')}
            />
          )}
          <div className={styles.school_info_container}>
            <SchoolDataInputs
              includeHeaders={false}
              containerClassName={styles.school_info_required}
              {...schoolInfo}
            />
            <Label
              errorMessage={formErrors.school_info}
              htmlFor={SCHOOL_INFO_ID}
            />
          </div>
        </>
      )}

      {(props.workshop_course === CSF ||
        props.workshop_course === ADMIN_COUNSELOR) && (
        <>
          <SimpleDropdown
            id="role"
            name="role"
            labelText=" What is your current role? (Select the role that best applies)"
            items={roles.map(r => ({value: r, text: r}))}
            selectedValue={formState.role}
            onChange={e => handleRoleChange(e.target.value)}
            dropdownTextThickness="thin"
            className={getRequiredStyles('role')}
            errorMessage={formErrors.role}
          />
          {formState.role && DESCRIBE_ROLES.includes(formState.role) && (
            <Label
              text="Please describe your role"
              className={getRequiredStyles('describe_role')}
              errorMessage={formErrors.describe_role}
              htmlFor="describe_role"
            >
              <textarea
                id="describe_role"
                name="describe_role"
                onChange={e =>
                  handleChange({
                    describe_role: e.target.value,
                  })
                }
                value={formState.describe_role}
              />
            </Label>
          )}

          {props.workshop_course !== ADMIN_COUNSELOR && (
            <Label
              className={getRequiredStyles('grades_teaching')}
              text="What grades are you teaching this year? (Select all that
                    apply)"
              errorMessage={formErrors.grades_teaching}
              htmlFor="grades_teaching"
            >
              <Typography
                semanticTag="p"
                visualAppearance="body-three"
                className={styles.no_margin}
              >
                This workshop is intended for teachers of grades K-5.
              </Typography>
              <fieldset>
                {gradesTeaching.map(grade => {
                  let stateKey:
                    | keyof Pick<
                        EnrollFormState,
                        'explain_not_teaching' | 'explain_teaching_other'
                      >
                    | undefined;
                  if (
                    grade.includes(NOT_TEACHING) &&
                    formState.grades_teaching.includes(grade)
                  ) {
                    stateKey = 'explain_not_teaching';
                  }
                  if (
                    grade.includes(OTHER) &&
                    formState.grades_teaching.includes(grade)
                  ) {
                    stateKey = 'explain_teaching_other';
                  }
                  return (
                    <Fragment key={grade}>
                      <Checkbox
                        size="s"
                        name={grade}
                        label={grade}
                        checked={formState.grades_teaching.includes(grade)}
                        onChange={e =>
                          handleChecked(
                            'grades_teaching',
                            grade,
                            e.target.checked
                          )
                        }
                      />
                      {stateKey && (
                        <Label
                          htmlFor={grade}
                          errorMessage={formErrors[stateKey]}
                        >
                          <textarea
                            id={grade}
                            name={grade}
                            onChange={e =>
                              handleChange({
                                [stateKey]: e.target.value,
                              })
                            }
                            value={formState[stateKey]}
                          />
                        </Label>
                      )}
                    </Fragment>
                  );
                })}
              </fieldset>
            </Label>
          )}
        </>
      )}
      {props.workshop_course === CSF &&
        (props.workshop_subject === INTRO ||
          props.workshop_subject === DISTRICT) && (
          <Label
            className={getRequiredStyles('csf_intro_intent')}
            text={csfIntroIntentLabel}
            errorMessage={formErrors.csf_intro_intent}
            htmlFor="csf_intro_intent"
          >
            <fieldset id="csf_intro_intent">
              <RadioButtonsGroup
                onChange={e =>
                  handleChange({
                    csf_intro_intent: e.target.value,
                  })
                }
                radioButtons={csfIntroIntentAnswers.map(option => ({
                  value: option,
                  name: option,
                  label: option,
                  size: 's',
                }))}
              />
            </fieldset>
          </Label>
        )}
      {props.workshop_course === CSF &&
        (props.workshop_subject === INTRO ||
          props.workshop_subject === DISTRICT) && (
          <Label
            className={getRequiredStyles('csf_intro_other_factors')}
            text={csfIntroOtherFactorsLabel}
            errorMessage={formErrors.csf_intro_other_factors}
            htmlFor="csf_intro_other_factors"
          >
            <fieldset id="csf_intro_other_factors">
              {csfIntroOtherFactorsAnswers.map(factor => (
                <Checkbox
                  key={factor}
                  size="s"
                  name={factor}
                  label={factor}
                  checked={formState.csf_intro_other_factors.includes(factor)}
                  onChange={e =>
                    handleChecked(
                      'csf_intro_other_factors',
                      factor,
                      e.target.checked
                    )
                  }
                />
              ))}
            </fieldset>
          </Label>
        )}
      {props.workshop_course === CSF &&
        props.workshop_subject === DEEP_DIVE && (
          <>
            <QuestionsTable
              id="csf_course_experience"
              label="This workshop is designed for educators that have experience teaching CS Fundamentals. During the past year, how have you used CS Fundamentals course(s) with students?"
              onChange={handleCsfCourseExperienceChange}
              options={['none', 'a few lessons', 'most lessons', 'all lessons']}
              questions={Object.entries(CSF_COURSES).map(([key, value]) => ({
                label: value,
                name: key,
              }))}
              selectedItems={formState.csf_course_experience}
              className={styles.table}
            />

            <Label
              className={getRequiredStyles('csf_courses_planned')}
              text={coursesPlannedLabel}
              errorMessage={formErrors.csf_courses_planned}
              htmlFor="csf_courses_planned"
            >
              <fieldset id="csf_courses_planned">
                {csfCourses.map(course => {
                  let stateKey:
                    | keyof Pick<EnrollFormState, 'explain_csf_course_other'>
                    | undefined;
                  if (
                    course.includes(OTHER) &&
                    formState.csf_courses_planned.includes(course)
                  ) {
                    stateKey = 'explain_csf_course_other';
                  }
                  return (
                    <Fragment key={course}>
                      <Checkbox
                        size="s"
                        name={course}
                        label={course}
                        checked={formState.csf_courses_planned.includes(course)}
                        onChange={e =>
                          handleChecked(
                            'csf_courses_planned',
                            course,
                            e.target.checked
                          )
                        }
                      />
                      {stateKey && (
                        <Label
                          htmlFor={course}
                          errorMessage={formErrors[stateKey]}
                        >
                          <textarea
                            id={course}
                            name={course}
                            value={formState[stateKey]}
                            onChange={e =>
                              handleChange({
                                [stateKey]: e.target.value,
                              })
                            }
                            className={styles.textarea}
                          />
                        </Label>
                      )}
                    </Fragment>
                  );
                })}
              </fieldset>
            </Label>

            <Label
              className={getRequiredStyles('attended_csf_intro_workshop')}
              text="Have you attended a CS Fundamentals Intro Workshop before?"
              errorMessage={formErrors.attended_csf_intro_workshop}
              htmlFor="attended_csf_intro_workshop"
            >
              <fieldset id="attended_csf_intro_workshop">
                <RadioButtonsGroup
                  onChange={e =>
                    handleChange({
                      attended_csf_intro_workshop: e.target.value,
                    })
                  }
                  radioButtons={Object.keys(ATTENDED_CSF_COURSES_OPTIONS).map(
                    option => ({
                      value: option,
                      name: option,
                      label: option,
                      size: 's',
                    })
                  )}
                />
              </fieldset>
            </Label>
          </>
        )}

      {props.collect_demographics && (
        <Label
          className={getRequiredStyles('previous_courses')}
          text="Which computer science courses or activities have you taught in
                the past?"
          errorMessage={formErrors.previous_courses}
          htmlFor="previous_courses"
        >
          <fieldset id="previous_courses">
            {previousCourses.map(course => (
              <Checkbox
                key={course}
                size="s"
                name={course}
                label={course}
                checked={formState.previous_courses.includes(course)}
                onChange={e =>
                  handleChecked('previous_courses', course, e.target.checked)
                }
              />
            ))}
          </fieldset>
        </Label>
      )}

      {props.workshop_course === CSP &&
        props.workshop_subject ===
          SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS && (
          <>
            <TextField
              id="years_teaching"
              name="years_teaching"
              label="Years Teaching (overall)"
              inputType="number"
              onChange={e =>
                handleChange({
                  years_teaching: e.target.value,
                })
              }
              errorMessage={formErrors.years_teaching}
              className={getRequiredStyles('years_teaching')}
            />
            <TextField
              id="years_teaching_cs"
              name="years_teaching_cs"
              label="Years Teaching Computer Science"
              inputType="number"
              onChange={e =>
                handleChange({
                  years_teaching_cs: e.target.value,
                })
              }
              errorMessage={formErrors.years_teaching_cs}
              className={getRequiredStyles('years_teaching_cs')}
            />

            <Label
              className={getRequiredStyles('taught_ap_before')}
              text={cspReturningTeachersTaughtAPLabel}
              errorMessage={formErrors.taught_ap_before}
              htmlFor="taught_ap_before"
            >
              <fieldset id="taught_ap_before">
                <RadioButtonsGroup
                  onChange={e =>
                    handleChange({
                      taught_ap_before: e.target.value,
                    })
                  }
                  radioButtons={cspReturningTeachersTaughtAPAnswers.map(
                    option => ({
                      value: option,
                      name: option,
                      label: option,
                      size: 's',
                    })
                  )}
                />
              </fieldset>
            </Label>

            <Label
              className={getRequiredStyles('planning_to_teach_ap')}
              text={cspReturningTeachersPlanningAPLabel}
              errorMessage={formErrors.planning_to_teach_ap}
              htmlFor="planning_to_teach_ap"
            >
              <fieldset id="planning_to_teach_ap">
                <RadioButtonsGroup
                  onChange={e =>
                    handleChange({
                      planning_to_teach_ap: e.target.value,
                    })
                  }
                  radioButtons={cspReturningTeachersPlanningAPAnswers.map(
                    option => ({
                      value: option,
                      name: option,
                      label: option,
                      size: 's',
                    })
                  )}
                />
              </fieldset>
            </Label>
          </>
        )}
      <Typography semanticTag="p" visualAppearance="body-four">
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
      </Typography>
      {Object.keys(formErrors).length > 0 && (
        <Alert
          id="form-errors"
          type="danger"
          text="Form errors found. Please check your responses above."
        />
      )}
      {submissionErrorMessage && (
        // TODO: use mailto link once Alert DSCO accepts jsx
        <Alert
          type="danger"
          text={`Sorry, we were unable to enroll you in this workshop: ${submissionErrorMessage}. Please double check your responses, and if the problem persists, contact support@code.org`}
        />
      )}
      <div>
        <Button
          id="submit"
          onClick={handleClickRegister}
          disabled={isSubmitting}
          isPending={isSubmitting}
          text="Register"
        />
      </div>
    </form>
  );
}
