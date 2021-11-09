import React from 'react';
import {FormGroup, Row, Col, ControlLabel} from 'react-bootstrap';
import {
  PageLabels,
  TextFields
} from '@cdo/apps/generated/pd/principalApprovalApplicationConstants';
import {Year} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import PrivacyDialog from '../PrivacyDialog';
import {PrivacyDialogMode} from '../../constants';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {isInt, isPercent, isZipCode} from '@cdo/apps/util/formatValidation';
import {styles} from '../teacher/TeacherApplicationConstants';

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

export default class PrincipalApprovalComponent extends LabeledFormComponent {
  static labels = PageLabels;

  static associatedFields = [
    ...Object.keys(PageLabels),
    ...REPLACE_COURSE_FIELDS,
    'doYouApprove',
    'committedToMasterSchedule',
    'committedToDiversity',
    'contactInvoicing',
    'contactInvoicingDetail'
  ];

  handleSchoolChange = selectedSchool => {
    this.handleChange({school: selectedSchool && selectedSchool.value});
  };

  state = {
    isPrivacyDialogOpen: false
  };

  openPrivacyDialog = event => {
    // preventDefault so clicking this link inside the label doesn't
    // also check the checkbox.
    event.preventDefault();
    this.setState({isPrivacyDialogOpen: true});
  };

  handleClosePrivacyDialog = () => {
    this.setState({isPrivacyDialogOpen: false});
  };

  renderSchoolSection() {
    // TODO: Mehal - this should be a separate component
    return (
      <div>
        <FormGroup
          id="school"
          controlId="school"
          validationState={this.getValidationState('school')}
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
                value={this.props.data.school}
                onChange={this.handleSchoolChange}
              />
            </Col>
          </Row>
        </FormGroup>
        {this.props.data.school && this.props.data.school === '-1' && (
          <div style={styles.indented}>
            {this.inputFor('schoolName')}
            {this.inputFor('schoolAddress')}
            {this.inputFor('schoolCity')}
            {this.selectFor('schoolState', {placeholder: 'Select a state'})}
            {this.inputFor('schoolZipCode')}
            {this.radioButtonsFor('schoolType')}
          </div>
        )}
      </div>
    );
  }

  renderSchoolInfoSection() {
    let showPayFeeNote =
      this.props.data.committedToMasterSchedule &&
      !this.props.data.committedToMasterSchedule.includes(
        `Yes, I plan to include this course in the ${Year} master schedule`
      ) &&
      this.props.data.payFee &&
      this.props.data.payFee.includes('No, ');

    return (
      <div>
        {this.renderSchoolSection()}
        {this.numberInputFor('totalStudentEnrollment')}
        {this.numberInputFor('freeLunchPercent', {
          min: 0,
          max: 100,
          step: 1
        })}
        <p style={styles.questionText}>
          Percent of student enrollment by race or ethnicity
        </p>
        {RACE_LIST.map(race => {
          return this.numberInputFor(race, {
            inlineControl: true,
            labelWidth: {md: 3},
            controlWidth: {md: 2},
            min: 0,
            max: 100,
            step: 1
          });
        })}
        {this.radioButtonsWithAdditionalTextFieldsFor(
          'committedToMasterSchedule',
          {
            [TextFields.otherWithText]: 'other'
          },
          {
            label: `Are you committed to including ${
              this.props.teacherApplication.course
            }
                    on the master schedule in ${Year} if ${
              this.props.teacherApplication.name
            }
                    is accepted into the program? Note: the program may be listed under a different
                    course name as determined by your district.`
          }
        )}
        {this.radioButtonsWithAdditionalTextFieldsFor('replaceCourse', {
          [TextFields.dontKnowExplain]: 'other'
        })}
        {this.props.data.replaceCourse === YES &&
          this.renderCourseReplacementSection()}
        {this.radioButtonsWithAdditionalTextFieldsFor(
          'committedToDiversity',
          {
            [TextFields.otherPleaseExplain]: 'other'
          },
          {
            label: `A key part of Code.org's mission is to increase and diversify participation
                    in computer science, especially among female students and underrepresented
                    racial and ethnic groups. To that end, do you commit to recruiting and 
                    enrolling a diverse group of students in this course, representative of 
                    the overall demographics of your school?`
          }
        )}
        <p style={styles.questionText}>
          There may be scholarships available in your region to cover the cost
          of the program.{' '}
          <a
            href={
              'https://code.org/educate/professional-learning/program-information' +
              (!!this.props.data.schoolZipCode
                ? '?zip=' + this.props.data.schoolZipCode
                : '')
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
          {this.singleCheckboxFor('understandFee')}
          {this.radioButtonsFor('payFee')}
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

          {this.inputFor('contactInvoicing', {required: false})}
          {this.inputFor('contactInvoicingDetail', {required: false})}
        </div>
        {this.props.teacherApplication.course ===
          'Computer Science Principles' && (
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
            {this.singleCheckboxFor('shareApScores', {
              required: false,
              label: `I am authorized to release student data and give permission for the College
              Board to send de-identified AP scores for Code.org classes directly to Code.org for
              the 2019 to 2022 school years. I understand that the de-identified data cannot be
              tied to individual students, will not be used to evaluate teachers, and will greatly
              help Code.org evaluate its program effectiveness.`
            })}
            <br />
            <br />
          </div>
        )}
      </div>
    );
  }

  renderCourseReplacementSection() {
    if (
      this.props.teacherApplication.course === 'Computer Science Discoveries'
    ) {
      return this.checkBoxesWithAdditionalTextFieldsFor(
        'replaceWhichCourseCsd',
        {
          [TextFields.otherPleaseExplain]: 'other'
        }
      );
    } else if (
      this.props.teacherApplication.course === 'Computer Science Principles'
    ) {
      return this.checkBoxesWithAdditionalTextFieldsFor(
        'replaceWhichCourseCsp',
        {
          [TextFields.otherPleaseExplain]: 'other'
        }
      );
    }
  }

  render() {
    const courseSuffix =
      this.props.teacherApplication.course === 'Computer Science Discoveries'
        ? 'csd'
        : 'csp';
    return (
      <FormGroup>
        <p>
          A teacher at your school, {this.props.teacherApplication.name}, has
          applied to be a part of{' '}
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
            {this.props.teacherApplication.course} curriculum
          </a>{' '}
          during the {Year} school year. We know that administrative support is
          essential to a teacher’s ability to fully commit to a) participating
          in a yearlong Professional Learning program and b) teaching a new
          course. That’s why your approval is required for the teacher's
          application to be considered.
        </p>
        <p>
          To help us measure our progress towards expanding access and providing
          resources where they’re needed most, we ask that you confirm
          demographic information about your school as well as how the course
          will be implemented during the upcoming school year.
        </p>
        {this.selectFor('title', {
          required: false,
          placeholder: 'Select a title'
        })}
        {this.inputFor('firstName')}
        {this.inputFor('lastName')}
        {this.inputFor('email')}
        <p>
          Participating teachers are asked to commit to Code.org’s yearlong
          Professional Learning Program starting in the summer and concluding in
          the spring. Workshops can either be held in-person, virtually, or as a
          combination of both throughout the year.
        </p>
        {this.radioButtonsWithAdditionalTextFieldsFor(
          'doYouApprove',
          {
            [TextFields.otherWithText]: 'other'
          },
          {
            label: `Do you approve of ${
              this.props.teacherApplication.name
            } participating
                    in Code.org's ${Year} Professional Learning Program?`
          }
        )}
        {this.props.data.doYouApprove !== 'No' &&
          this.renderSchoolInfoSection()}

        <label className="control-label">Submit your approval</label>
        {this.singleCheckboxFor('confirmPrincipal', {
          label: (
            <span>
              {this.labelFor('confirmPrincipal')}{' '}
              <a onClick={this.openPrivacyDialog}>Learn more.</a>
            </span>
          )
        })}
        <PrivacyDialog
          show={this.state.isPrivacyDialogOpen}
          onHide={this.handleClosePrivacyDialog}
          mode={PrivacyDialogMode.PRINCIPAL_APPROVAL}
        />
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
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
        }
      }
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
    let formatErrors = {};

    if (data.schoolZipCode && !isZipCode(data.schoolZipCode)) {
      formatErrors.schoolZipCode = 'Must be a valid zip code';
    }

    if (
      data.totalStudentEnrollment &&
      (!isInt(data.totalStudentEnrollment) || data.totalStudentEnrollment <= 0)
    ) {
      formatErrors.totalStudentEnrollment =
        'Must be a valid and positive number';
    }

    ['freeLunchPercent', ...RACE_LIST].forEach(key => {
      if (data[key] && !isPercent(data[key])) {
        formatErrors[key] = 'Must be a valid percent between 0 and 100';
      }
    });

    return formatErrors;
  }

  /**
   * @override
   */
  static processPageData(data) {
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
  }
}

export {
  ALWAYS_REQUIRED_FIELDS,
  MANUAL_SCHOOL_FIELDS,
  REQUIRED_SCHOOL_INFO_FIELDS,
  RACE_LIST
};
