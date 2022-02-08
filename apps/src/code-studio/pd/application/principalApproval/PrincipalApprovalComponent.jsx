import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Row, Col, ControlLabel} from 'react-bootstrap';
import {
  PageLabels,
  TextFields
} from '@cdo/apps/generated/pd/principalApprovalApplicationConstants';
import {Year} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {
  FormContext,
  getValidationState
} from '../../form_components_func/FormComponent';
import PrivacyDialog from '../PrivacyDialog';
import {PrivacyDialogMode} from '../../constants';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {isInt, isPercent, isZipCode} from '@cdo/apps/util/formatValidation';
import {styles} from '../teacher/TeacherApplicationConstants';
import {
  LabeledInput,
  LabeledNumberInput
} from '../../form_components_func/labeled/LabeledInput';
import {LabeledSelect} from '../../form_components_func/labeled/LabeledSelect';
import {LabeledSingleCheckbox} from '../../form_components_func/labeled/LabeledSingleCheckbox';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabeledCheckBoxesWithAdditionalTextFields} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {useRegionalPartner} from '../../components/useRegionalPartner';

const MANUAL_SCHOOL_FIELDS = [
  'schoolName',
  'schoolAddress',
  'schoolCity',
  'schoolState',
  'schoolZipCode',
  'schoolType'
];
const RACE_LIST = [
  'white',
  'black',
  'hispanic',
  'asian',
  'pacificIslander',
  'americanIndian',
  'other'
];
const REQUIRED_SCHOOL_INFO_FIELDS = [
  'school',
  'totalStudentEnrollment',
  'freeLunchPercent',
  ...RACE_LIST,
  'committedToMasterSchedule',
  'replaceCourse',
  'committedToDiversity',
  'understandFee',
  'payFee'
];
// Since the rails model allows empty principal approvals as placeholders, we require these fields here
const ALWAYS_REQUIRED_FIELDS = [
  'doYouApprove',
  'firstName',
  'lastName',
  'email',
  'confirmPrincipal'
];
const REPLACE_COURSE_FIELDS = [
  'replaceWhichCourseCsp',
  'replaceWhichCourseCsd'
];
const YES = 'Yes';
const COURSE_SUFFIXES = {
  'Computer Science Discoveries': 'csd',
  'Computer Science Principles': 'csp',
  'Computer Science A': 'csa'
};

const PrincipalApprovalComponent = props => {
  const {teacherApplication, onChange, data, errors} = props;
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [regionalPartner] = useRegionalPartner({
    program: teacherApplication.course,
    school: teacherApplication.school_id,
    schoolZipCode: teacherApplication.school_zip_code,
    schoolState: teacherApplication.school_state
  });

  const handleSchoolChange = selectedSchool => {
    onChange({school: selectedSchool && selectedSchool.value});
  };

  const openPrivacyDialog = event => {
    // preventDefault so clicking this link inside the label doesn't
    // also check the checkbox.
    event.preventDefault();
    setIsPrivacyDialogOpen(true);
  };

  const handleClosePrivacyDialog = () => {
    setIsPrivacyDialogOpen(false);
  };

  const renderSchoolSection = () => {
    return (
      <>
        <p>
          To help us measure our progress towards expanding access and providing
          resources where they’re needed most, we ask that you confirm
          demographic information about your school as well as how the course
          will be implemented during the upcoming school Year.
        </p>
        <FormGroup
          id="school"
          controlId="school"
          validationState={getValidationState('school', errors)}
        >
          <Row>
            <Col md={6}>
              <ControlLabel>
                School
                <span style={{color: 'red'}}> *</span>
              </ControlLabel>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <SchoolAutocompleteDropdown
                value={data.school}
                onChange={handleSchoolChange}
              />
            </Col>
          </Row>
        </FormGroup>
        {data.school && data.school === '-1' && (
          <div style={styles.indented}>
            <LabeledInput name="schoolName" />
            <LabeledInput name="schoolAddress" />
            <LabeledInput name="schoolCity" />
            <LabeledSelect name="schoolState" placeholder="Select a state" />
            <LabeledInput name="schoolZipCode" />
            <LabeledRadioButtons name="schoolType" />
          </div>
        )}
      </>
    );
  };

  const renderCourseReplacementSection = () => {
    if (teacherApplication.course === 'Computer Science Discoveries') {
      return (
        <LabeledCheckBoxesWithAdditionalTextFields
          name="replaceWhichCourseCsd"
          textFieldMap={{
            [TextFields.otherPleaseExplain]: 'other'
          }}
        />
      );
    } else if (teacherApplication.course === 'Computer Science Principles') {
      return (
        <LabeledCheckBoxesWithAdditionalTextFields
          name="replaceWhichCourseCsp"
          textFieldMap={{
            [TextFields.otherPleaseExplain]: 'other'
          }}
        />
      );
    } else if (teacherApplication.course === 'Computer Science A') {
      return (
        <LabeledCheckBoxesWithAdditionalTextFields
          name="replaceWhichCourseCsa"
          textFieldMap={{
            [TextFields.otherPleaseExplain]: 'other'
          }}
        />
      );
    }
  };

  const renderSchoolInfoSection = () => {
    let showPayFeeNote =
      data.committedToMasterSchedule &&
      !data.committedToMasterSchedule.includes(
        `Yes, I plan to include this course in the ${Year} master schedule`
      ) &&
      data.payFee &&
      data.payFee.includes('No, ');

    return (
      <div>
        {renderSchoolSection()}
        <LabeledNumberInput name="totalStudentEnrollment" />
        <LabeledNumberInput
          name="freeLunchPercent"
          min={0}
          max={100}
          step={1}
        />
        <p style={styles.questionText}>
          Percent of student enrollment by race or ethnicity
        </p>
        {RACE_LIST.map((race, i) => {
          return (
            <LabeledNumberInput
              name={race}
              key={i}
              inlineControl={true}
              labelWidth={{md: 3}}
              controlWidth={{md: 2}}
              min={0}
              max={100}
              step={1}
            />
          );
        })}
        <LabeledRadioButtonsWithAdditionalTextFields
          name="committedToMasterSchedule"
          textFieldMap={{
            [TextFields.otherWithText]: 'other'
          }}
          label={`Are you committed to including ${
            teacherApplication.course
          } on the master schedule in ${Year} if ${
            teacherApplication.name
          } is accepted into the program? Note: the program may be listed under a different course name as determined by your district.`}
        />
        <LabeledRadioButtonsWithAdditionalTextFields
          name="replaceCourse"
          textFieldMap={{
            [TextFields.dontKnowExplain]: 'other'
          }}
        />

        {data.replaceCourse === YES && renderCourseReplacementSection()}
        <LabeledRadioButtonsWithAdditionalTextFields
          name="committedToDiversity"
          textFieldMap={{
            [TextFields.otherPleaseExplain]: 'other'
          }}
          label={`A key part of Code.org's mission is to increase and diversify participation
          in computer science, especially among female students and underrepresented
          groups. To that end, do you commit to recruiting and 
          enrolling a diverse group of students in this course, representative of 
          the overall demographics of your school?`}
        />

        <p style={styles.questionText}>
          {regionalPartner ? regionalPartner.name : 'Your regional partner'} may
          have scholarships available to cover the cost of the program.{' '}
          <a
            href={
              'https://code.org/educate/professional-learning/program-information' +
              (!!data.schoolZipCode ? '?zip=' + data.schoolZipCode : '')
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here to check the fees and discounts for your program
          </a>
          . Let us know if your school would be able to pay the fee or if you
          need to be considered for a scholarship.
        </p>
        <div>
          <LabeledSingleCheckbox name="understandFee" />
          <LabeledRadioButtons name="payFee" />
          {showPayFeeNote && (
            <div>
              <p style={styles.red}>
                Note: To be eligible for scholarship support, your school must
                commit to including this course in the {Year} master schedule.
                If you are able to commit to offering this course in {Year} ,
                please update your answer above before submitting in order to
                retain scholarship eligibility.
              </p>
              <br />
            </div>
          )}

          <LabeledInput name="contactInvoicing" required={false} />
          <LabeledInput name="contactInvoicingDetail" required={false} />
        </div>
        {teacherApplication.course === 'Computer Science Principles' && (
          <div>
            <p style={styles.questionText}>
              If you are planning to offer CS Principles as an AP course, please
              review the{' '}
              <a
                href="https://code.org/csp/ap-score-sharing-agreement"
                target="_blank"
                rel="noopener noreferrer"
              >
                AP Score Sharing Agreement
              </a>
              .
            </p>
            <LabeledSingleCheckbox
              name="shareApScores"
              required={false}
              label={`I am authorized to release student data and give permission for the College
            Board to send de-identified AP scores for Code.org classes directly to Code.org for
            the 2019 to 2022 school Years. I understand that the de-identified data cannot be
            tied to individual students, will not be used to evaluate teachers, and will greatly
            help Code.org evaluate its program effectiveness.`}
            />

            <br />
            <br />
          </div>
        )}
      </div>
    );
  };

  const courseSuffix = COURSE_SUFFIXES[teacherApplication.course] || 'csp';
  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels}>
        <FormGroup>
          <p>
            A teacher at your school, {teacherApplication.name}, has applied to
            be a part of{' '}
            <a
              href="https://code.org/educate/professional-learning/middle-high"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code.org's Professional Learning Program
            </a>{' '}
            in order to teach the{' '}
            <a
              href={`https://code.org/educate/${courseSuffix}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {teacherApplication.course} curriculum
            </a>{' '}
            during the {Year} school Year. This program is delivered by our
            local Code.org Regional Partner
            {regionalPartner ? `, ${regionalPartner.name}` : ''}. Participating
            teachers are asked to commit to Code.org’s Professional Learning
            Program starting in the summer and concluding in the spring.
            Workshops can either be held in-person, virtually, or as a
            combination of both throughout the Year.
          </p>
          <p>
            We know that administrative support is essential to a teacher’s
            ability to fully commit to participating in a Yearlong professional
            learning program and teaching a new course. That’s why your approval
            is required for the teacher's application to be considered.
          </p>
          <LabeledSelect
            name="title"
            required={false}
            placeholder="Select a title"
          />
          <LabeledInput name="firstName" />
          <LabeledInput name="lastName" />
          <LabeledInput name="email" />
          <LabeledRadioButtonsWithAdditionalTextFields
            name="doYouApprove"
            textFieldMap={{
              [TextFields.otherWithText]: 'other'
            }}
            label={`Do you approve of ${teacherApplication.name} participating
                  in Code.org's ${Year} Professional Learning Program${
              regionalPartner ? ` with ${regionalPartner.name}` : ''
            }?`}
          />

          {data.doYouApprove !== 'No' && renderSchoolInfoSection()}

          <label className="control-label">Submit your approval</label>
          <LabeledSingleCheckbox
            name="confirmPrincipal"
            label={
              <span>
                {PageLabels.confirmPrincipal.replace(
                  '[regional partner]',
                  regionalPartner?.name || 'my local Code.org Regional Partner'
                )}{' '}
                <a onClick={openPrivacyDialog}>Learn more.</a>
              </span>
            }
          />
          <PrivacyDialog
            show={isPrivacyDialogOpen}
            onHide={handleClosePrivacyDialog}
            mode={PrivacyDialogMode.PRINCIPAL_APPROVAL}
          />
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};
PrincipalApprovalComponent.propTypes = {
  options: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorMessages: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  teacherApplication: PropTypes.object.isRequired
};

PrincipalApprovalComponent.associatedFields = [
  ...Object.keys(PageLabels),
  ...REPLACE_COURSE_FIELDS,
  'doYouApprove',
  'committedToMasterSchedule',
  'committedToDiversity',
  'contactInvoicing',
  'contactInvoicingDetail'
];

PrincipalApprovalComponent.getDynamicallyRequiredFields = data => {
  let requiredFields = [...ALWAYS_REQUIRED_FIELDS];

  if (data.school && data.school === '-1') {
    requiredFields.push(
      'schoolName',
      'schoolAddress',
      'schoolCity',
      'schoolState',
      'schoolZipCode',
      'schoolType'
    );
  }

  if (data.doYouApprove !== 'No') {
    requiredFields.push(...REQUIRED_SCHOOL_INFO_FIELDS);
    if (data.replaceCourse === YES) {
      if (data.course === 'Computer Science Discoveries') {
        requiredFields.push('replaceWhichCourseCsd');
      } else if (data.course === 'Computer Science Principles') {
        requiredFields.push('replaceWhichCourseCsp');
      } else if (data.course === 'Computer Science A') {
        requiredFields.push('replaceWhichCourseCsa');
      }
    }
  }

  return requiredFields;
};

PrincipalApprovalComponent.getErrorMessages = data => {
  let formatErrors = {};

  if (data.schoolZipCode && !isZipCode(data.schoolZipCode)) {
    formatErrors.schoolZipCode = 'Must be a valid zip code';
  }

  if (
    data.totalStudentEnrollment &&
    (!isInt(data.totalStudentEnrollment) || data.totalStudentEnrollment <= 0)
  ) {
    formatErrors.totalStudentEnrollment = 'Must be a valid and positive number';
  }

  ['freeLunchPercent', ...RACE_LIST].forEach(key => {
    if (data[key] && !isPercent(data[key])) {
      formatErrors[key] = 'Must be a valid percent between 0 and 100';
    }
  });

  return formatErrors;
};

PrincipalApprovalComponent.processPageData = data => {
  let changes = {};
  let fieldsToClear = [];

  // Clear out all the form data if the principal rejects the application
  if (data.doYouApprove === 'No') {
    fieldsToClear = fieldsToClear.concat(REQUIRED_SCHOOL_INFO_FIELDS);
    fieldsToClear = fieldsToClear.concat(REPLACE_COURSE_FIELDS);
  }

  // Clear out school form data if we have a school
  if (data.school && data.school !== '-1') {
    fieldsToClear = fieldsToClear.concat(MANUAL_SCHOOL_FIELDS);
  }

  // Clear out replaced course if we are not replacing a course
  if (data.replaceCourse !== YES) {
    fieldsToClear = fieldsToClear.concat(REPLACE_COURSE_FIELDS);
  }

  if (data.doYouApprove !== 'No') {
    // Sanitize numeric fields (necessary for older browsers that don't
    // automatically enforce numeric inputs)
    ['freeLunchPercent', ...RACE_LIST].forEach(field => {
      if (data[field]) {
        changes[field] = parseFloat(data[field]).toString();
      }
    });
  }

  fieldsToClear.forEach(field => {
    changes[field] = undefined;
  });

  return changes;
};

export {
  ALWAYS_REQUIRED_FIELDS,
  MANUAL_SCHOOL_FIELDS,
  REQUIRED_SCHOOL_INFO_FIELDS,
  RACE_LIST
};

export default PrincipalApprovalComponent;
