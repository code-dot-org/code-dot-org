import React from 'react';
import {FormGroup, Row, Col, ControlLabel} from "react-bootstrap";
import {
  PageLabels,
  TextFields
} from '@cdo/apps/generated/pd/principalApproval1920ApplicationConstants';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {isInt, isPercent} from '@cdo/apps/util/formatValidation';
import {styles} from '../teacher1920/TeacherApplicationConstants';

const MANUAL_SCHOOL_FIELDS = ['schoolName', 'schoolAddress', 'schoolCity',
  'schoolState', 'schoolZipCode', 'schoolType'];
const RACE_LIST = ['white', 'black', 'hispanic', 'asian', 'pacificIslander', 'americanIndian', 'other'];
const REQUIRED_SCHOOL_INFO_FIELDS = ['goingToTeach', 'school', 'totalStudentEnrollment',
  'freeLunchPercent', ...RACE_LIST, 'committedToMasterSchedule', 'replaceCourse', 'committedToDiversity',
  'understandFee', 'payFee', 'howHeard'
];
const REPLACE_COURSE_FIELDS = ['replaceWhichCourseCsp', 'replaceWhichCourseCsd'];
const YEAR = "2019-20";

export default class PrincipalApproval1920Component extends LabeledFormComponent {
  static labels = PageLabels;

  static associatedFields = Object.keys(PageLabels);

  handleSchoolChange = selectedSchool => {
    this.handleChange({school: selectedSchool && selectedSchool.value});
  };

  renderSchoolSection() {
    // TODO: Mehal - this should be a separate component
    return (
      <div>
        <FormGroup
          id="school"
          controlId="school"
          validationState={this.getValidationState("school")}
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
        {
          this.props.data.school && this.props.data.school === '-1' &&
          <div style={styles.indented}>
            {this.inputFor("schoolName")}
            {this.inputFor("schoolAddress")}
            {this.inputFor("schoolCity")}
            {this.selectFor("schoolState", {placeholder: "Select a state"})}
            {this.inputFor("schoolZipCode")}
            {this.radioButtonsFor("schoolType")}
          </div>
        }
      </div>
    );
  }

  renderSchoolInfoSection() {
    return (
      <div>
        {
          this.radioButtonsWithAdditionalTextFieldsFor('goingToTeach', {
            [TextFields.otherWithText]: "other"
          }, {
            label: `Is ${this.props.teacherApplication.name} going to teach this course in
                    the ${YEAR} school year?`,
          })
        }
        {this.renderSchoolSection()}
        {this.inputFor('totalStudentEnrollment')}
        {this.numberInputFor('freeLunchPercent', {
          min: 0,
          max: 100,
          step: 1
        })}
        Percentage of student enrollment by race
        {
          RACE_LIST.map(race => {
            return this.numberInputFor(race, {
              inlineControl: true,
              labelWidth: { md: 3 },
              controlWidth: { md: 2 },
              min: 0,
              max: 100,
              step: 1
            });
          })
        }
        {
          this.radioButtonsWithAdditionalTextFieldsFor('committedToMasterSchedule', {
            [TextFields.otherWithText]: "other"
          }, {
            label: `Are you committed to including ${this.props.teacherApplication.course}
                    on the master schedule in ${YEAR} if ${this.props.teacherApplication.name}
                    is accepted into the program? Note: the program may be listed under a different
                    course name as determined by your district.`
          })
        }
        {this.renderImplementationSection()}
        {this.radioButtonsWithAdditionalTextFieldsFor('replaceCourse', {
          [TextFields.dontKnowExplain] : "other"
        })}
        {
          this.props.data.replaceCourse === 'Yes' && this.renderCourseReplacementSection()
        }
        {
          this.radioButtonsWithAdditionalTextFieldsFor('committedToDiversity', {
            [TextFields.otherPleaseExplain] : "other"
          }, {
            label: `A key part of Code.org's mission is to increase and diversify participation
                    in computer science, especially among female students and underrepresented
                    minorities. To that end, do you commit to recruiting and enrolling a diverse
                    group of students in this course, representative of the overall demographics
                    of your school?`
          })
        }
        <p>
          There may be a fee associated with your teacher’s summer workshop. Please
          carefully <a href="https://docs.google.com/spreadsheets/d/1YFrTFp-Uz0jWk9-UR9JVuXfoDcCL6J0hxK5CYldv_Eo" target="_blank">
          look here</a> to find more information about the workshop.
        </p>
        <div>
          {this.singleCheckboxFor('understandFee')}
          {this.radioButtonsFor('payFee')}
          {
            this.props.data.payFee && this.props.data.payFee.startsWith('No,') && (
              <div>
                Would you like to be considered for funding support? Note that funding
                support is not guaranteed.
                {this.singleCheckboxFor('wantFunding', {required: false})}
              </div>
            )
          }
        </div>
        {this.radioButtonsWithAdditionalTextFieldsFor('howHeard', {
          [TextFields.otherWithText] : "other"
        })}
        {this.props.teacherApplication.course === 'Computer Science Principles' &&
          <div>
            <p>
              If you are planning to offer CS Principles as an AP course, please review the AP Score Sharing Agreement.
            </p>
            {this.singleCheckboxFor('shareApScores', {
              required: false,
              label: `I am authorized to release student data and give permission for the College
              Board to send de-identified AP scores for Code.org classes directly to Code.org for
              the 2019 to 2021 school years. I understand that the de-identified data cannot be
              tied to individual students, will not be used to evaluate teachers, and will greatly
              help Code.org evaluate its program effectiveness.`
            })}
          </div>
        }
        <p>
          Code.org works closely with local Regional Partners to organize and deliver the Professional
          Learning Program. By submitting their application to the professional learning program,
          teachers have agreed to allow Code.org to share information on how they use Code.org and the
          Professional Learning resources with their Regional Partner and school district. In order to
          organize the workshops and support teachers, our partners need to know who is attending and
          what content is relevant for them. So, we will share teachers’ contact information, which
          courses/units they are using in their classrooms and aggregate data about their classes. This
          includes the number of students in their classes, the demographic breakdown of their classroom,
          and the name of their school and district. We will not share any information about individual
          students with our Regional Partners - all information will be de-identified and aggregated. Our
          Regional Partners are contractually obliged to treat this information with the same level of
          confidentiality as Code.org. To see Code.org’s complete Privacy Policy, visit <a href="http://code.org/privacy">
          http://code.org/privacy</a>.
        </p>
      </div>
    );
  }

  renderCourseReplacementSection() {
    if (this.props.teacherApplication.course === 'Computer Science Discoveries') {
      return this.checkBoxesWithAdditionalTextFieldsFor('replaceWhichCourseCsd', {
        [TextFields.otherPleaseExplain] : "other"
      });
    } else if (this.props.teacherApplication.course === 'Computer Science Principles') {
      return this.checkBoxesWithAdditionalTextFieldsFor('replaceWhichCourseCsp',{
        [TextFields.otherPleaseExplain] : "other"
      });
    }
  }

  renderImplementationSection() {
    const question_label = `To participate in Code.org’s ${this.props.teacherApplication.course} Professional
                  Learning Program, we require that this course be offered in one of the following
                  ways. Please select which option will be implemented at your school. Be sure to
                  review the guidance on required number of hours here prior to answering.`;
    const other_label = "We will use a different implementation schedule. (Please Explain):";

    if (this.props.teacherApplication.course === 'Computer Science Discoveries') {
      return this.radioButtonsWithAdditionalTextFieldsFor('csdImplementation', {
          [other_label] : 'other'
        },
        {label: question_label}
      );
    } else if (this.props.teacherApplication.course === 'Computer Science Principles') {
      return this.radioButtonsWithAdditionalTextFieldsFor('cspImplementation', {
          [other_label] : 'other'
        },
        {label: question_label}
      );
    }
  }

  render() {
    return (
      <FormGroup>
        <p>
          Thank you for your support of computer science education! A teacher at your
          school, {this.props.teacherApplication.name}, has applied to be a part of
          Code.org’s Professional Learning Program to teach the {' '}
          {this.props.teacherApplication.course} curriculum during the {YEAR} school
          year. Your approval is required for the teacher’s application
          to be considered.
        </p>
        {
          this.selectFor('title', {
            required: false,
            placeholder: 'Select a title',
          })
        }
        {this.inputFor('firstName')}
        {this.inputFor('lastName')}
        {this.inputFor('email')}
        {
          this.radioButtonsWithAdditionalTextFieldsFor('doYouApprove', {
            [TextFields.otherWithText]: "other"
          }, {
            label: `Do you approve of ${this.props.teacherApplication.name} participating
                    in Code.org's ${YEAR} Professional Learning Program?`,
          })
        }
        {this.props.data.doYouApprove !== 'No' && this.renderSchoolInfoSection()}
        {this.singleCheckboxFor('confirmPrincipal')}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.school && data.school === '-1') {
      requiredFields.push(
        "schoolName",
        "schoolAddress",
        "schoolCity",
        "schoolState",
        "schoolZipCode",
        "schoolType"
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

    if (data.replaceCourse === 'Yes') {
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
      formatErrors.totalStudentEnrollment = "Must be a valid number";
    }

    ['freeLunchPercent', ...RACE_LIST].forEach((key) => {
      if (data[key] && !isPercent(data[key])) {
        formatErrors[key] = "Must be a valid percent between 0 and 100";
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
      fieldsToClear.add([...REQUIRED_SCHOOL_INFO_FIELDS, REPLACE_COURSE_FIELDS]);
    }

    // Clear out school form data if we have a school
    if (data.school && data.school !== -1) {
      fieldsToClear.add(MANUAL_SCHOOL_FIELDS);
    }

    // Clear out replaced course if we are not replacing a course
    if (data.replaceCourse !== 'Yes') {
      fieldsToClear.add(REPLACE_COURSE_FIELDS);
    }

    return changes;
  }
}

export {MANUAL_SCHOOL_FIELDS, REQUIRED_SCHOOL_INFO_FIELDS, RACE_LIST};
