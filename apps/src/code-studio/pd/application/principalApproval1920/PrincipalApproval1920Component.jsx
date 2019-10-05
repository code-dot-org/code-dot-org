import React from 'react';
import {FormGroup, Row, Col, ControlLabel} from 'react-bootstrap';
import {
  PageLabels,
  TextFields
} from '@cdo/apps/generated/pd/principalApproval1920ApplicationConstants';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import PrivacyDialog from '../PrivacyDialog';
import {PrivacyDialogMode} from '../../constants';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {isInt, isPercent} from '@cdo/apps/util/formatValidation';
import {styles} from '../teacher2021/TeacherApplicationConstants';

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
  'planToTeach',
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
const IMPLEMENTATION_FIELDS = ['csdImplementation', 'cspImplementation'];
const YEAR = '2019-20';

export default class PrincipalApproval1920Component extends LabeledFormComponent {
  static labels = PageLabels;

  static associatedFields = [
    ...Object.keys(PageLabels),
    ...REPLACE_COURSE_FIELDS,
    ...IMPLEMENTATION_FIELDS,
    'doYouApprove',
    'planToTeach',
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
        'Yes, I plan to include this course in the 2019-20 master schedule'
      ) &&
      this.props.data.payFee &&
      this.props.data.payFee.includes('No, ');

    const planToTeachOther =
      'I don’t know if they will teach this course (Please Explain):';
    return (
      <div>
        {this.radioButtonsWithAdditionalTextFieldsFor(
          'planToTeach',
          {
            [planToTeachOther]: 'other'
          },
          {
            label: `Is ${
              this.props.teacherApplication.name
            } planning to teach this course in
                    the ${YEAR} school year?`
          }
        )}
        {this.renderSchoolSection()}
        {this.inputFor('totalStudentEnrollment')}
        {this.numberInputFor('freeLunchPercent', {
          min: 0,
          max: 100,
          step: 1
        })}
        <p style={styles.questionText}>
          Percentage of student enrollment by race
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
                    on the master schedule in ${YEAR} if ${
              this.props.teacherApplication.name
            }
                    is accepted into the program? Note: the program may be listed under a different
                    course name as determined by your district.`
          }
        )}
        {this.radioButtonsWithAdditionalTextFieldsFor('replaceCourse', {
          [TextFields.dontKnowExplain]: 'other'
        })}
        {this.props.data.replaceCourse ===
          TextFields.yesReplaceExistingCourse &&
          this.renderCourseReplacementSection()}
        {this.renderImplementationSection()}
        {this.radioButtonsWithAdditionalTextFieldsFor(
          'committedToDiversity',
          {
            [TextFields.otherPleaseExplain]: 'other'
          },
          {
            label: `A key part of Code.org's mission is to increase and diversify participation
                    in computer science, especially among female students and underrepresented
                    minorities. To that end, do you commit to recruiting and enrolling a diverse
                    group of students in this course, representative of the overall demographics
                    of your school?`
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
                commit to including this course in the 2019-20 master schedule.
                If you are able to commit to offering this course in 2019-20,
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
              >
                AP Score Sharing Agreement
              </a>
              .
            </p>
            {this.singleCheckboxFor('shareApScores', {
              required: false,
              label: `I am authorized to release student data and give permission for the College
              Board to send de-identified AP scores for Code.org classes directly to Code.org for
              the 2019 to 2021 school years. I understand that the de-identified data cannot be
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

  renderImplementationSection() {
    const questionLabel = (
      <span>
        To participate in Code.org’s {this.props.teacherApplication.course}{' '}
        Professional Learning Program, we require that this course be offered in
        one of the following ways. Please select which option will be
        implemented at your school. Be sure to{' '}
        <a
          href="https://docs.google.com/document/d/1nFp033SuO_BMR-Bkinrlp0Ti_s-XYQDsOc-UjqNdrGw/edit#heading=h.6s62vrpws18"
          target="_blank"
        >
          review the guidance on required number of hours here
        </a>{' '}
        prior to answering.
      </span>
    );
    const otherLabel =
      'We will use a different implementation schedule. (Please Explain):';

    if (
      this.props.teacherApplication.course === 'Computer Science Discoveries'
    ) {
      return this.radioButtonsWithAdditionalTextFieldsFor(
        'csdImplementation',
        {
          [otherLabel]: 'other'
        },
        {label: questionLabel}
      );
    } else if (
      this.props.teacherApplication.course === 'Computer Science Principles'
    ) {
      return this.radioButtonsWithAdditionalTextFieldsFor(
        'cspImplementation',
        {
          [otherLabel]: 'other'
        },
        {label: questionLabel}
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
            href="https://code.org/educate/professional-learning-2019"
            target="_blank"
          >
            Code.org’s Professional Learning Program
          </a>{' '}
          in order to teach the{' '}
          <a href={`https://code.org/educate/${courseSuffix}`} target="_blank">
            {this.props.teacherApplication.course} curriculum
          </a>{' '}
          during the {YEAR} school year. Your approval is required for the
          teacher’s application to be considered.
        </p>
        {this.selectFor('title', {
          required: false,
          placeholder: 'Select a title'
        })}
        {this.inputFor('firstName')}
        {this.inputFor('lastName')}
        {this.inputFor('email')}
        <p>Teachers in this program are required to participate in both:</p>
        <ul>
          <li>One five-day, in-person summer workshop in 2019</li>
          <li>
            Up to four one-day, in-person local workshops during the 2019-20
            school year (typically held on Saturdays)
          </li>
        </ul>
        {this.radioButtonsWithAdditionalTextFieldsFor(
          'doYouApprove',
          {
            [TextFields.otherWithText]: 'other'
          },
          {
            label: `Do you approve of ${
              this.props.teacherApplication.name
            } participating
                    in Code.org's ${YEAR} Professional Learning Program?`
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
    const requiredFields = ALWAYS_REQUIRED_FIELDS;

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

      if (data.course === 'Computer Science Discoveries') {
        requiredFields.push('csdImplementation');
      } else if (data.course === 'Computer Science Principles') {
        requiredFields.push('cspImplementation');
      }
    }

    if (data.replaceCourse === TextFields.yesReplaceExistingCourse) {
      if (data.course === 'Computer Science Discoveries') {
        requiredFields.push('replaceWhichCourseCsd');
      } else if (data.course === 'Computer Science Principles') {
        requiredFields.push('replaceWhichCourseCsp');
      }
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (data.totalStudentEnrollment && !isInt(data.totalStudentEnrollment)) {
      formatErrors.totalStudentEnrollment = 'Must be a valid number';
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
    const changes = {};
    const fieldsToClear = new Set();

    // Clear out all the form data if the principal rejects the application
    if (data.doYouApprove === 'No') {
      fieldsToClear.add([
        ...REQUIRED_SCHOOL_INFO_FIELDS,
        REPLACE_COURSE_FIELDS,
        IMPLEMENTATION_FIELDS
      ]);
    }

    // Clear out school form data if we have a school
    if (data.school && data.school !== -1) {
      fieldsToClear.add(MANUAL_SCHOOL_FIELDS);
    }

    // Clear out replaced course if we are not replacing a course
    if (data.replaceCourse !== TextFields.yesReplaceExistingCourse) {
      fieldsToClear.add(REPLACE_COURSE_FIELDS);
    }

    // Sanitize numeric fields (necessary for older browsers that don't
    // automatically enforce numeric inputs)
    ['freeLunchPercent', ...RACE_LIST].forEach(field => {
      changes[field] = parseFloat(data[field]).toString();
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
