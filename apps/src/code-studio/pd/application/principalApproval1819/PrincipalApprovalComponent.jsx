import React from 'react';
import {FormGroup, Row, Col, ControlLabel} from "react-bootstrap";
import {
  PageLabels,
  TextFields
} from '@cdo/apps/generated/pd/principalApproval1819ApplicationConstants';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {isInt, isPercent} from '@cdo/apps/util/formatValidation';
import {styles} from '../teacher1819/TeacherApplicationConstants';

const MANUAL_SCHOOL_FIELDS = ['schoolName', 'schoolAddress', 'schoolCity',
  'schoolState', 'schoolZipCode', 'schoolType'];
const RACE_LIST = ['white', 'black', 'hispanic', 'asian', 'pacificIslander', 'americanIndian', 'other'];
const REQUIRED_SCHOOL_INFO_FIELDS = ['school', 'totalStudentEnrollment',
  'freeLunchPercent', ...RACE_LIST, 'committedToMasterSchedule', 'hoursPerYear',
  'termsPerYear', 'replaceCourse', 'committedToDiversity', 'understandFee', 'payFee'
];
const REPLACE_COURSE_FIELDS = ['replaceWhichCourseCsp', 'replaceWhichCourseCsd'];

export default class PrincipalApprovalComponent extends LabeledFormComponent {
  static labels = PageLabels;

  static associatedFields = Object.keys(PageLabels);

  handleSchoolChange = selectedSchool => {
    this.handleChange({school: selectedSchool && selectedSchool.value});
  };

  renderSchoolSection() {
    // TODO: Mehal - this should be a seperate component
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
        {this.renderSchoolSection()}
        {this.inputFor('totalStudentEnrollment')}
        {this.numberInputFor('freeLunchPercent', {
          min: 0,
          max: 100
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
            });
          })
        }
        {
          this.radioButtonsWithAdditionalTextFieldsFor('committedToMasterSchedule', {
            [TextFields.otherWithText]: "other"
          }, {
            label: `Are you committed to including ${this.props.teacherApplication.course}
                    on the master schedule in 2018-19 if accepted into the program? Note:
                    the program may be listed under a different course name as determined
                    by your district.`
          })
        }
        {this.radioButtonsFor('hoursPerYear')}
        {this.radioButtonsFor('termsPerYear')}
        {this.radioButtonsWithAdditionalTextFieldsFor('replaceCourse', {
          [TextFields.dontKnowExplain] : "other"
        })}
        {
          this.props.data.replaceCourse === 'Yes' && this.renderCourseReplacementSection()
        }
        {this.radioButtonsWithAdditionalTextFieldsFor('committedToDiversity', {
          [TextFields.otherPleaseExplain] : "other"
        })}
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
        <p>
          Code.org works closely with local Regional Partners to organize and deliver the
          Professional Learning Program.  By submitting this form, teachers are
          agreeing to allow Code.org to share information on how they use Code.org and the
          Professional Learning resources with their Regional Partner and school district.
          In order to organize the workshops and support teachers, our partners need to
          know who is attending and what content is relevant for them. So, we will share
          teachers’ contact information, which courses/units they are using in their
          classrooms and aggregate data about their classes. This includes the number of
          students in their classes, the demographic breakdown of their classroom, and the
          name of their school and district. We will not share any information about
          individual students with our Regional Partners - all information will be
          de-identified and aggregated. Our Regional Partners are contractually obliged to
          treat this information with the same level of confidentiality as Code.org.
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

  render() {
    return (
      <FormGroup>
        <p>
          Thank you for your support of computer science education! A teacher at your
          school, {this.props.teacherApplication.name} has applied to be a part of
          Code.org’s Professional Learning Program in order to teach the {' '}
          {this.props.teacherApplication.course} curriculum during the 2018-19  school
          year. Your completion of this survey is required for the teacher’s application
          to be considered.
        </p>
        {this.inputFor('firstName')}
        {this.inputFor('lastName')}
        {
          this.selectFor('title', {
            required: false,
            placeholder: 'Select a title',
          })
        }
        {this.inputFor('email')}
        {
          this.radioButtonsWithAdditionalTextFieldsFor('doYouApprove', {
            [TextFields.otherWithText]: "other"
          }, {
            label: `Do you approve of ${this.props.teacherApplication.name} participating
                    in Code.org's 2018 - 19 Professional Learning Program?`,
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
