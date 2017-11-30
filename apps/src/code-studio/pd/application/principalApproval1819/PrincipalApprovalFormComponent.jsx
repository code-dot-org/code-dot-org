import React from 'react';
import {FormGroup, Row, Col, ControlLabel} from "react-bootstrap";
import {PageLabels} from '@cdo/apps/generated/pd/principalApproval1819ApplicationConstants';
import ApplicationFormComponent from '../ApplicationFormComponent';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {isInt, isPercent} from '@cdo/apps/util/formatValidation';

const RACE_LIST = ['white', 'black', 'hispanic', 'asian', 'pacificIslander', 'americanIndian', 'other'];

export default class PrincipalApprovalComponent extends ApplicationFormComponent {
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
          <div>
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

  renderCourseReplacementSection() {
    if (this.props.teacherApplication.course === 'Computer Science Discoveries') {
      return this.checkBoxesWithAdditionalTextFieldsFor('replaceWhichCourseCsd', {
        "Other (Please Explain):" : "other"
      });
    } else if (this.props.teacherApplication.course === 'Computer Science Principles') {
      return this.checkBoxesWithAdditionalTextFieldsFor('replaceWhichCourseCsp',{
        "Other (Please Explain):" : "other"
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
        {this.inputFor('firstName', {value: this.props.teacherApplication.principal_first_name, readOnly: true})}
        {this.inputFor('lastName', {value: this.props.teacherApplication.principal_last_name, readOnly: true})}
        {
          this.selectFor('title', {
            required: false,
            placeholder: 'Select a title',
            value: this.props.teacherApplication.principal_title,
            readOnly: true
          })
        }
        {this.inputFor('email', {value: this.props.teacherApplication.principal_email, readOnly: true})}
        {this.renderSchoolSection()}
        {this.inputFor('totalStudentEnrollment')}
        {this.inputFor('freeLunchPercent')}
        Percentage of student enrollment by race
        {
          RACE_LIST.map(
            (race) => {
              return this.inputFor(race, {inlineControl: true, labelWidth: {md: 3}, controlWidth: {md: 1}});
            }
          )
        }
        {
          this.radioButtonsWithAdditionalTextFieldsFor('doYouApprove', {
            "Other:": "other"
          }, {
            label: `Do you approve of ${this.props.teacherApplication.name} participating
                    in Code.org's 2018 - 19 Professional Learning Program?`,
          })
        }
        {
          this.radioButtonsWithAdditionalTextFieldsFor('committedToMasterSchedule', {
            "Other:": "other"
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
          "I don't know (please explain):": "other"
        })}
        {
          this.props.data.replaceCourse === 'Yes' && this.renderCourseReplacementSection()
        }
        {this.radioButtonsWithAdditionalTextFieldsFor('committedToDiversity', {
          "Other (Please Explain):": "other"
        })}
        <p>
          There may be a fee associated with your teacher’s summer workshop. Please
          carefully <a href="https://docs.google.com/spreadsheets/d/1YFrTFp-Uz0jWk9-UR9JVuXfoDcCL6J0hxK5CYldv_Eo" target="_blank">
          look here</a> to find more information about the workshop.
        </p>
        <div>
          By checking this box, you indicate that you understand there may be a program
          fee for the summer workshop your teacher attends.
          {this.singleCheckboxFor('understandFee')}
          {this.radioButtonsFor('payFee')}
          {
            this.props.data.payFee && this.props.data.payFee.startsWith('No') && (
              <div>
                Would you like to be considered for funding support? Note that funding
                support is not guaranteed.
                {this.singleCheckboxFor('wantFunding')}
              </div>
            )
          }
        </div>
        <p>
          Code.org works closely with local Regional Partners to organize and deliver the
          Professional Learning Program.  By enrolling in this workshop, teachers are
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
        {this.singleCheckboxFor('confirmPrincipal')}
      </FormGroup>
    );
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
}
