/**
 * Teacher Application questionaire
 */

import React, {PropTypes} from 'react';
import $ from 'jquery';
import _ from 'lodash';
import {
  HelpBlock,
  Button,
  Radio,
  FormControl,
  FormGroup,
  ControlLabel
} from 'react-bootstrap';
import {otherString, ButtonList} from '../form_components/ButtonList.jsx';
import {validateDistrictData} from './district_dropdown_helper.js';
import SummerProgramContent from './SummerProgramContent';
import {getWorkshopForState} from './applicationConstants.js';
import MD5 from 'crypto-js/md5';

const requiredStar = (<span style={{color: 'red'}}> *</span>);

function FieldGroup({ id, label, validationState, required, errorText, ...props }) {
  if (errorText) {
    validationState = 'error';
  }

  if (!(props['maxLength'])) {
    props['maxLength'] = 1000;
  }

  return (
    <FormGroup controlId={id} validationState={validationState}>
      <ControlLabel>{label}{required && requiredStar}</ControlLabel>
      <FormControl {...props} />
      {errorText && <HelpBlock>{errorText}</HelpBlock>}
      <br/>
    </FormGroup>
  );
}

FieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  validationState: PropTypes.string,
  errorText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  required: PropTypes.bool,
  maxLength: PropTypes.number
};

const grades = ['Kindergarten'].concat(_.map(_.range(1,13), x => x.toString()));
const subjects = ['Computer Science', 'Computer Literacy', 'Math', 'Science', 'History', 'English', 'Music', 'Art',
  'Multimedia', 'Foreign Language', 'Business'];
const yesNoResponses = ['Yes', 'No'];
const requiredFields = ['gradesAtSchool', 'firstName', 'lastName', 'primaryEmail', 'secondaryEmail', 'phoneNumber',
  'genderIdentity', 'grades2016', 'subjects2016','grades2017', 'subjects2017', 'principalFirstName',
  'principalLastName', 'principalPrefix', 'principalEmail', 'selectedCourse'];
const requiredCsdFields = ['gradesPlanningToTeach'];
const requiredCspFields = ['cspDuration', 'cspApCourse', 'gradesPlanningToTeach', 'cspApExamIntent'];
const requiredSurveyFields = ['committedToSummer', 'allStudentsShouldLearn',
  'allStudentsCanLearn', 'newApproaches', 'allAboutContent', 'allAboutProgramming', 'csCreativity',
  'currentCsOpportunities', 'whyCsIsImportant', 'whatTeachingSteps'];
const likertSurveyCell = {textAlign: 'center', width: '10%'};
const likertAnswers = ['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree'];

const EMAIL_RE = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const isEmail = (value) => {
  if (!value.match(EMAIL_RE)) {
    return 'Please enter a valid email address, like name@example.com';
  }
};

const isPhoneNumber = (value) => {
  if (value.replace(/[^0-9]/g, '').length < 10) {
    return 'Phone numbers must have at least 10 digits, like (123) 456-7890';
  }
};

const isUnder1000Chars = (value) => {
  if (value.length > 1000) {
    return 'Please limit your response to 1000 characters';
  }
};

const TeacherApplication = React.createClass({
  propTypes: {
    regionalPartnerGroup: PropTypes.number,
    regionalPartnerName: PropTypes.string,
    workshopDays: PropTypes.string,
    schoolDistrictData: PropTypes.object.isRequired,
    districtErrorMessageHandler: PropTypes.func.isRequired,
    accountEmail: PropTypes.string,
    hashedAccountEmail: PropTypes.string.isRequired
  },

  componentWillMount() {
    // Validate primary email is a valid email string, and that it matches the account email.
    // In case it's an accidental student account (which will be converted to teacher on submit)
    // compare with the hashed email.
    // Note: this function relies on the props.hashedAccountEmail, so it must be created in a lifecycle method.
    const validatePrimaryEmail = (value) => {
      const isEmailError = isEmail(value);
      if (isEmailError) {
        return isEmailError;
      }

      if (MD5(value.toLowerCase()).toString() !== this.props.hashedAccountEmail) {
        return (
          <div>
            Primary email must match your login.
            If you want to use this email instead, first update it in&nbsp;
            <a href="/users/edit">
              account settings.
            </a>
          </div>
        );
      }
    };

    this.fieldValidationErrors = {
      primaryEmail: validatePrimaryEmail,
      secondaryEmail: isEmail,
      principalEmail: isEmail,
      phoneNumber: isPhoneNumber,
      whyCsIsImportant: isUnder1000Chars,
      whatTeachingSteps: isUnder1000Chars,
    };
  },

  getInitialState() {
    return this.props.accountEmail ? {primaryEmail: this.props.accountEmail} : {};
  },

  handleSubformDataChange(changedData) {
    this.setState(changedData);
  },

  handleTextChange(event) {
    this.setState({[event.target.id]: event.target.value});
  },

  handleRadioListChange(event) {
    this.setState({[event.target.name]: event.target.value});
  },

  handleButtonListChange(changedData) {
    this.setState(changedData);
  },

  getRequiredValidationErrorMessage(key) {
    if (this.state[key] !== undefined) {
      if (this.state[key].length > 0) {
        if (this.fieldValidationErrors[key]) {
          return this.fieldValidationErrors[key](this.state[key]);
        }
      } else {
        return 'This field is required';
      }
    }
  },

  getRequiredValidationState(key) {
    if (this.state[key] !== undefined) {
      return this.getRequiredValidationErrorMessage(key) ? 'error' : null;
    }
  },

  getLikertValidationState(key) {
    if (this.state[key] !== undefined && this.state[key].length === 0) {
      return 'error';
    }
  },

  componentWillUpdate() {
    this._errorData = null;
  },

  get errorData() {
    if (!this._errorData) {
      this._errorData = {};
      for (const key in this.state) {
        this._errorData[key] = this.getRequiredValidationErrorMessage(key);
      }
    }

    return this._errorData;
  },

  shouldShowRegionalPartnersOnlyWarning() {
    return ['private', 'other'].includes(this.props.schoolDistrictData['school-type'].toLowerCase());
  },

  shouldShowWorkingToIdentifyRegionalPartnerWarning() {
    return !!(
      ['public', 'charter'].includes(this.props.schoolDistrictData['school-type'].toLowerCase()) &&
      !(this.props.regionalPartnerGroup) &&
      (this.props.schoolDistrictData['school-district'] || this.props.schoolDistrictData['school-district-other'])
    );
  },

  generateTeacherInformationSection() {
    return (
      <div>
        {
          this.shouldShowRegionalPartnersOnlyWarning() && (
          <label id="regionalPartnersOnlyWarning" style={{color: 'red'}}>
            Thank you for your interest in Code.org’s Professional Learning Program! Due to high demand for our
            program, most spots are reserved for public school teachers in regions where we have a Regional Partner.
            You are a private school teacher and/or your area does not yet have a Code.org Regional Partner. If you
            would like to continue this application, please note that we will consider it for review if spaces
            remain at the end of our application period.
          </label>
        )}
        {
          this.shouldShowWorkingToIdentifyRegionalPartnerWarning() && (
            <label id="identifyingRegionalPartnerWarning" style={{color: 'red'}}>
              Thank you for your interest in Code.org’s Professional Learning Program! We are working to identify the
              Regional Partner that will serve your school, and the dates of your five-day summer workshop. We will
              update you with more details on your assigned partner and the date of your summer workshop soon.
            </label>
          )
        }
        <ButtonList
          type="check"
          label="Grades served at your school"
          groupName="gradesAtSchool"
          answers={grades}
          onChange={this.handleButtonListChange}
          selectedItems={this.state.gradesAtSchool}
          required={true}
          validationState={this.getRequiredValidationState('gradesAtSchool')}
        />
        <h2>
          Section 2: Teacher Information
        </h2>
        <FieldGroup
          id="firstName"
          label="First name"
          type="text"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('firstName')}
        />
        <FieldGroup
          id="preferredFirstName"
          label="Preferred First Name"
          type="text"
          onChange={this.handleTextChange}
        />
        <FieldGroup
          id="lastName"
          label="Last Name"
          type="text"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('lastName')}
        />
        <FieldGroup
          id="primaryEmail"
          label="Primary email address"
          type="email"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('primaryEmail')}
          defaultValue={this.props.accountEmail}
        />
        <FieldGroup
          id="secondaryEmail"
          label="Secondary email address (we may need to contact you during the summer)"
          type="email"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('secondaryEmail')}
        />
        <FieldGroup
          id="phoneNumber"
          label="Phone Number (Please provide a phone number that we can use to reach you year-round)"
          type="text"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('phoneNumber')}
        />
        <ButtonList
          type="radio"
          label="Gender Identity"
          groupName="genderIdentity"
          answers={["Female", "Male", "Other", "Prefer not to answer"]}
          onChange={this.handleButtonListChange}
          selectedItems={this.state.genderIdentity}
          required={true}
          validationState={this.getRequiredValidationState('genderIdentity')}
        />
        <ButtonList
          type="check"
          label="What grades are you teaching in the current 2016-17 school year? (select all that apply)"
          groupName="grades2016"
          answers={grades}
          includeOther={true}
          onChange={this.handleButtonListChange}
          selectedItems={this.state.grades2016}
          required={true}
          validationState={this.getRequiredValidationState('grades2016')}
        />
        <ButtonList
          type="check"
          label="What subjects are you teaching in the current 2016-17 school year? (select all that apply)"
          groupName="subjects2016"
          answers={subjects}
          includeOther={true}
          onChange={this.handleButtonListChange}
          selectedItems={this.state.subjects2016}
          required={true}
          validationState={this.getRequiredValidationState('subjects2016')}
        />
        <ButtonList
          type="check"
          label="What grades will you be teaching in the 2017-18 school year? (select all that apply)"
          groupName="grades2017"
          answers={grades.concat("I don't know")}
          includeOther={true}
          onChange={this.handleButtonListChange}
          selectedItems={this.state.grades2017}
          required={true}
          validationState={this.getRequiredValidationState('grades2017')}
        />
        <ButtonList
          type="check"
          label="What subjects will you be teaching in the 2017-18 school year? (select all that apply)"
          groupName="subjects2017"
          answers={subjects.concat("I don't know")}
          includeOther={true}
          onChange={this.handleButtonListChange}
          selectedItems={this.state.subjects2017}
          required={true}
          validationState={this.getRequiredValidationState('subjects2017')}
        />
        <FieldGroup
          id="principalFirstName"
          label="Principal's first name"
          type="text"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('principalFirstName')}
        />
        <FieldGroup
          id="principalLastName"
          label="Principal's last name"
          type="text"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('principalLastName')}
        />
        <FormGroup validationState={this.getRequiredValidationState('principalPrefix')}>
          <ControlLabel>
            Principal's prefix
            {requiredStar}
          </ControlLabel>
          <FormControl
            componentClass="select"
            id="principalPrefix"
            onChange={this.handleTextChange}
            defaultValue="select one"
          >
            <option value="select one" disabled>select one</option>
            <option value="Dr.">Dr.</option>
            <option value="Miss.">Miss.</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
          </FormControl>
        </FormGroup>
        <FieldGroup
          id="principalEmail"
          label="Principal's Email Address"
          type="email"
          onChange={this.handleTextChange}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('principalEmail')}
        />
      </div>
    );
  },

  renderCourseSelection() {
    return (
      <FormGroup id="selectedCourse" validationState={this.getRequiredValidationState('selectedCourse')}>
        <ControlLabel>
          Which professional learning program are you applying to join for the 2017-18 school year? Click on each
          curriculum for more information. Note: this application is only for
          <a href="https://code.org/educate/professional-learning/cs-discoveries" target="_blank"> Computer Science Discoveries</a> and
          <a href="https://code.org/educate/professional-learning/cs-principles" target="_blank"> Computer Science Principles.</a> If
          you are a K-5 teacher interested in <a href="https://code.org/educate/curriculum/elementary-school" target="_blank">Computer Science
          Fundamentals</a>, please visit <a href="https://code.org/educate/curriculum/elementary-school" target="_blank">this page </a>
          for information about workshops in your area. (Select one)
          {requiredStar}
        </ControlLabel>
        <Radio
          value="csd"
          name="selectedCourse"
          onChange={this.handleRadioListChange}
        >
          Computer Science Discoveries (designed for 7th - 9th grade)
        </Radio>
        <Radio
          value="csp"
          name="selectedCourse"
          onChange={this.handleRadioListChange}
        >
          Computer Science Principles (designed for 9th - 12th grade, and can be implemented as an AP or introductory course)
        </Radio>
      </FormGroup>
    );
  },

  renderCSDSpecificContent() {
    if (this.state.selectedCourse === 'csd') {
      return (
        <div id="csdSpecificContent">
          <ButtonList
            type="check"
            label="To which grades do you plan to teach CS Discoveries? Please note that the CS Discoveries Professional Learning Program is not available for grades K-5. (select all that apply)"
            groupName="gradesPlanningToTeach"
            answers={grades.slice(grades.indexOf('6'))}
            onChange={this.handleButtonListChange}
            selectedItems={this.state.gradesPlanningToTeach}
            required={true}
            validationState={this.getRequiredValidationState('gradesPlanningToTeach')}
          />
        </div>
      );
    }
  },

  renderCSPSpecificContent() {
    if (this.state.selectedCourse === 'csp') {
      return (
        <div id="cspSpecificContent">
          <ButtonList
            type="radio"
            label="I will be teaching Computer Science Principles as a (select one):"
            answers={[
              'Year-long course (~180 contact hours)',
              'Semester-long course (~90 contact hours)',
              'Semester-long course on block scheduling (~180 contact hours)',
            ]}
            includeOther={true}
            groupName="cspDuration"
            onChange={this.handleButtonListChange}
            selectedItems={this.state.cspDuration}
            required={true}
            validationState={this.getRequiredValidationState('cspDuration')}
          />
          <ButtonList
            type="radio"
            label="I will be teaching Computer Science Principles as an (select one)"
            answers={[
              "AP course only",
              "Introductory course only",
              "AP course and introductory course",
              "I don't know yet"
            ]}
            groupName="cspApCourse"
            onChange={this.handleButtonListChange}
            selectedItems={this.state.cspApCourse}
            required={true}
            validationState={this.getRequiredValidationState('cspApCourse')}
          />
          <ButtonList
            type="check"
            label="To which grades do you plan to teach CS Principles? Please note that the CS Principles Professional
            Learning Program is not available for grades K-8. (select all that apply)"
            answers={grades.slice(grades.indexOf('9'))}
            groupName="gradesPlanningToTeach"
            onChange={this.handleButtonListChange}
            selectedItems={this.state.gradesPlanningToTeach}
            required={true}
            validationState={this.getRequiredValidationState('gradesPlanningToTeach')}
          />
          <ButtonList
            type="radio"
            label="Is it your goal for your students to take the AP CSP exam in the spring of 2018? Note: even if CS
            Principles is taught as an introductory course, students are still eligible to take the AP CSP exam.
            (select one)"
            groupName="cspApExamIntent"
            answers={yesNoResponses}
            onChange={this.handleButtonListChange}
            selectedItems={this.state.cspApExamIntent}
            required={true}
            validationState={this.getRequiredValidationState('cspApExamIntent')}
          />
        </div>
      );
    }
  },

  renderComputerScienceBeliefsPoll() {
    const csBeliefsQuestions = {
      allStudentsShouldLearn: 'All students should have the opportunity to learn computer science in school.',
      allStudentsCanLearn: 'All students can learn computer science.',
      newApproaches: 'I am willing to learn new approaches to teaching in order to engage my students.',
      allAboutContent: 'Effective teaching of computer science is all about knowing the content.',
      allAboutProgramming: 'Computer science is all about programming.',
      csCreativity: 'Computer science has a lot to do with problem solving and creativity.'
    };

    return (
      <div>
        <ControlLabel>
          Please rate the following questions:
        </ControlLabel>
        <table>
          <thead>
            <tr>
              <th/>
              {
                likertAnswers.map( (answer, i) => {
                  return (
                    <th style={likertSurveyCell} key={i}>{answer}</th>
                  );
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(csBeliefsQuestions).map( (question, i) => {
                return (
                  <tr key={i}>
                    <td>
                      <FormGroup id={question} validationState={this.getLikertValidationState(question)}>
                        <ControlLabel>
                          {csBeliefsQuestions[question]}
                        </ControlLabel>
                      </FormGroup>
                    </td>
                    {
                      likertAnswers.map( (answer, j) => {
                        return (
                          <td key={j} style={likertSurveyCell}>
                            <Radio
                              name={question}
                              value={j + 1}
                              checked={parseInt(this.state[question], 10) === j + 1}
                              onChange={this.handleRadioListChange}
                            />
                          </td>
                        );
                      })
                    }
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        <hr/>
      </div>
    );
  },

  renderComputerScienceAtYourSchool() {
    return (
      <div>
        <label style={{fontWeight: 'bold', fontSize: '16px'}}>
          We would like to learn more about your school, and why you want to participate in our Professional Learning
          Program. Please share your responses to the following questions:
        </label>
        <ButtonList
          type="check"
          label="What computer science opportunities currently exist at your school? (select all that apply)"
          groupName="currentCsOpportunities"
          answers={['Courses for credit', 'After school clubs', 'Lunch clubs', 'Hour of Code',
            'No computer science opportunities are currently available at my school']}
          includeOther={true}
          onChange={this.handleButtonListChange}
          selectedItems={this.state.currentCsOpportunities}
          required={true}
          validationState={this.getRequiredValidationState('currentCsOpportunities')}
        />
        <FieldGroup
          id="whyCsIsImportant"
          label="Why do you believe access to computer science education is important for your students?"
          componentClass="textarea"
          onChange={this.handleTextChange}
          style={{width: '100%'}}
          rows={4}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('whyCsIsImportant')}
        />
        <FieldGroup
          id="whatTeachingSteps"
          label="What steps will you and your school need to take to ensure that enough students enroll in your computer
           science course(s) to keep the course(s) on the master schedule?"
          componentClass="textarea"
          onChange={this.handleTextChange}
          style={{width: '100%'}}
          rows={4}
          required={true}
          errorText={this.getRequiredValidationErrorMessage('whatTeachingSteps')}
        />
      </div>
    );
  },

  onSubmitButtonClick() {
    this.setState({submitting: true});

    const formData = _.omit(_.cloneDeep(this.state), ['submitting']);

    let topInvalidElementId = undefined;

    let fieldsToValidate = _.compact(_.concat(requiredFields,
      this.state.selectedCourse === 'csd' && requiredCsdFields,
      this.state.selectedCourse === 'csp' && requiredCspFields,
      requiredSurveyFields
    ));

    /*
     If we see Other String, then replace it with the value of the input control in the script
     */
    _.forEach(formData, (value, key) => {
      if (value && value.indexOf(otherString) >= 0) {
        const valueToReplaceWith = $(`#${key}_other`).val();

        if (typeof(value) === 'string') {
          formData[key] = valueToReplaceWith;
        }  else {
          value[value.indexOf(otherString)] = valueToReplaceWith;
          formData[key] = value;
        }
      }
    });

    Object.assign(formData, this.props.schoolDistrictData);

    formData['assignedWorkshop'] = getWorkshopForState(
      this.props.regionalPartnerGroup,
      this.props.regionalPartnerName,
      this.state.selectedCourse,
      this.props.schoolDistrictData['school-state']
    );

    if (!this.shouldShowRegionalPartnersOnlyWarning() && !this.shouldShowWorkingToIdentifyRegionalPartnerWarning()) {
      fieldsToValidate.splice(fieldsToValidate.indexOf('committedToSummer') + 1, 0, 'ableToAttendAssignedSummerWorkshop');
    }

    if (formData.ableToAttendAssignedSummerWorkshop && formData.ableToAttendAssignedSummerWorkshop !== 'Yes') {
      formData.fallbackSummerWorkshops = this.state.fallbackSummerWorkshops;

      fieldsToValidate.splice(fieldsToValidate.indexOf('ableToAttendAssignedSummerWorkshop') + 1, 0, 'fallbackSummerWorkshops');
    }

    _.forEach(fieldsToValidate, (field) => {
      if (this.fieldValidationErrors[field] && this.state[field]) {
        if (this.fieldValidationErrors[field](this.state[field])) {
          topInvalidElementId = topInvalidElementId || field;
        }
      } else if (this.state[field] === undefined || this.state[field].length === 0) {
        this.setState({[field]: ''});
        topInvalidElementId = topInvalidElementId || field;
      }
    });

    if (validateDistrictData(this.props.schoolDistrictData)) {
      this.props.districtErrorMessageHandler('');
    } else {
      topInvalidElementId = 'district-error-placeholder';
      this.props.districtErrorMessageHandler("Please complete this section with your school's information");
    }

    if (topInvalidElementId) {
      this.setState({submitting: false});
      let topInvalidElement = document.getElementById(topInvalidElementId);

      if (topInvalidElement) {
        if (topInvalidElement.className.indexOf('form-group') >= 0) {
          topInvalidElement.scrollIntoView();
        } else {
          topInvalidElement.parentElement.scrollIntoView();
        }
      }
    } else {
      this.save(formData);
    }
  },

  save(formData) {
    this.startRequest = $.ajax({
      method: "POST",
      url: "/api/v1/pd/teacher_applications",
      contentType: 'application/json',
      dataType: "json",
      data: JSON.stringify({application: formData})
    }).done(() => {
      window.location.reload(true);
    }).fail(data => {
      // TODO: render error message(s) nicely on client.
      alert(`error: ${data.responseJSON}`);
    });
  },

  renderSubmitButton() {
    return (
      <div>
        <label style={{fontSize: '16px', fontWeight: 'bold'}}>
          Code.org works closely with local Regional Partners to organize and deliver the Professional Learning Program.
          By clicking “Complete and Send,” you are agreeing to allow Code.org to share the information provided in this
          survey with your assigned Regional Partner and your school district.
        </label>
        <Button
          onClick={this.onSubmitButtonClick}
          disabled={this.state.submitting}
        >
          Complete and Send
        </Button>
      </div>
    );
  },

  renderAfterCourseSelectionSection() {
    return (
      <div>
        {this.state.selectedCourse === 'csd' && this.renderCSDSpecificContent()}
        {this.state.selectedCourse === 'csp' && this.renderCSPSpecificContent()}
        <hr/>
        <SummerProgramContent
          onChange={this.handleSubformDataChange}
          formData={this.state}
          errorData={this.errorData}
          selectedWorkshop={this.props.workshopDays || getWorkshopForState(
            this.props.regionalPartnerGroup,
            this.props.regionalPartnerName,
            this.state.selectedCourse,
            this.props.schoolDistrictData['school-state']
          )}
        />
        <hr/>
        {this.renderComputerScienceBeliefsPoll()}
        {this.renderComputerScienceAtYourSchool()}
      </div>
    );
  },

  render() {
    return (
      <div>
        {this.generateTeacherInformationSection()}
        <hr/>
        {this.renderCourseSelection()}
        <hr/>
        {this.state.selectedCourse && this.renderAfterCourseSelectionSection()}
        {this.renderSubmitButton()}
      </div>
    );
  }
});

export {TeacherApplication, likertAnswers};
