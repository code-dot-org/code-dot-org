/**
 * Teacher Application questionaire
 */

import React from 'react';
import ReactDOM from 'react-dom';
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
import {otherString, ButtonList} from '../form_components/button_list.jsx';
import {getDistrictDropdownValues, validateDistrictData} from './district_dropdown_helper.js';
import SummerProgramContent from './SummerProgramContent';

const requiredStar = (<span style={{color: 'red'}}> *</span>);

function FieldGroup({ id, label, validationState, required, errorText, ...props }) {
  if (errorText) {
    validationState = 'error';
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
  id: React.PropTypes.string.isRequired,
  label: React.PropTypes.string,
  validationState: React.PropTypes.string,
  errorText: React.PropTypes.string,
  required: React.PropTypes.bool
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
const requiredSurveyFields = ['committedToSummer', 'ableToAttendAssignedSummerWorkshop', 'allStudentsShouldLearn',
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

const fieldValidationErrors = {
  primaryEmail: isEmail,
  secondaryEmail: isEmail,
  principalEmail: isEmail,
  phoneNumber: isPhoneNumber,
};

const TeacherApplication = React.createClass({

  propTypes: {
    regionalPartnerGroup: React.PropTypes.number
  },

  getInitialState() {
    return {

    };
  },

  handleSubformDataChange(changedData) {
    this.setState(changedData);
  },

  handleTextChange(event) {
    this.setState({[event.target.id]: event.target.value});
  },

  handleRadioButtonListChange(event) {
    this.setState({[event.target.name]: event.target.value});
  },

  handleCheckboxChange(event) {
    const selectedButtons = $(`[name=${event.target.name}]:checked`).map( (index, element) => element.value).toArray();
    this.setState({[event.target.name]: selectedButtons});
  },

  getRequiredValidationErrorMessage(key) {
    if (this.state[key] !== undefined) {
      if (this.state[key].length > 0) {
        if (fieldValidationErrors[key]) {
          return fieldValidationErrors[key](this.state[key]);
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

  generateTeacherInformationSection() {
    return (
      <div>
        {!(this.props.regionalPartnerGroup) && document.querySelector('#school-district input').value && (
          <label style={{color: 'red'}}>
            Thank you for your interest in Code.org’s Professional Learning Program! Due to high demand for our program,
            most spots are reserved for teachers in regions where we have a Regional Partner. If you would like to
            continue this application, please note that we will consider it for review if spaces remain at the end of
            our application period.
          </label>
        )}
        <ButtonList
          type="check"
          label="Grades served at your school"
          groupName="gradesAtSchool"
          answers={grades}
          onChange={this.handleCheckboxChange}
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
          onChange={this.handleRadioButtonListChange}
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
          onChange={this.handleCheckboxChange}
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
          onChange={this.handleCheckboxChange}
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
          onChange={this.handleCheckboxChange}
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
          onChange={this.handleCheckboxChange}
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
          name="courseSelection"
          onChange={this.handleCourseChange}
        >
          Computer Science Discoveries (designed for 7th - 9th grade)
        </Radio>
        <Radio
          value="csp"
          name="courseSelection"
          onChange={this.handleCourseChange}
        >
          Computer Science Principles (designed for 9th - 12th grade, and can be implemented as an AP or introductory course)
        </Radio>
      </FormGroup>
    );
  },

  handleCourseChange(event) {
    this.setState({selectedCourse: event.target.value});
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
            onChange={this.handleCheckboxChange}
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
            onChange={this.handleRadioButtonListChange}
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
            onChange={this.handleRadioButtonListChange}
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
            onChange={this.handleCheckboxChange}
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
            onChange={this.handleRadioButtonListChange}
            selectedItems={this.state.cspApExamIntent}
            required={true}
            validationState={this.getRequiredValidationState('cspApExamIntent')}
          />
        </div>
      );
    }
  },

  renderSummerProgramContent() {
    return (
      <div id="summerProgramContent">
        <div style={{fontWeight: 'bold'}}>
          As a reminder, teachers in this program are required to participate in:
          <li>
            One five-day summer workshop in 2017 (may require travel with expenses paid)
          </li>
          <li>
            Four one-day local workshops during the 2017 - 18 school year (typically held on Saturdays)
          </li>
          <li>
            20 hours of online professional development during the 2017 - 18 school year
          </li>
          <ButtonList
            type="radio"
            label="Are you committed to participating in the entire program?"
            groupName="committedToSummer"
            answers={yesNoResponses}
            includeOther={true}
            onChange={this.handleRadioButtonListChange}
            selectedItems={this.state.committedToSummer}
            required={true}
            validationState={this.getRequiredValidationState('committedToSummer')}
          />
          {this.renderSummerWorkshopSchedule()}
        </div>
      </div>
    );
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
                      <FormGroup validationState={this.getLikertValidationState(question)}>
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
                              onChange={this.handleRadioButtonListChange}
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
        <p style={{fontWeight: 'bold', fontSize: '16px'}}>
          We would like to learn more about your school, and why you want to participate in our Professional Learning
          Program. Please share your responses to the following questions:
        </p>
        <ButtonList
          type="check"
          label="What computer science opportunities currently exist at your school? (select all that apply)"
          groupName="currentCsOpportunities"
          answers={['Courses for credit', 'After school clubs', 'Lunch clubs', 'Hour of Code',
            'No computer science opportunities are currently available at my school']}
          includeOther={true}
          onChange={this.handleCheckboxChange}
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
          validationState={this.getRequiredValidationState('whyCsIsImportant')}
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
          validationState={this.getRequiredValidationState('whatTeachingSteps')}
        />
      </div>
    );
  },

  onSubmitButtonClick() {
    const districtValues = getDistrictDropdownValues();

    const formData = _.cloneDeep(this.state);
    _.assign(formData, districtValues);

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

    _.forEach(fieldsToValidate, (field) => {
      if (this.state[field] === undefined || this.state[field].length === 0) {
        this.setState({[field]: ''});
        topInvalidElementId = topInvalidElementId || field;
      }
    });

    if (validateDistrictData(districtValues)) {
      document.getElementById('district-error-placeholder').innerHTML = '';
    } else {
      topInvalidElementId = 'district-error-placeholder';
      ReactDOM.render(
        <p style={{color: 'red', fontSize: '14pt', fontWeight: 'bold'}}>
          Please complete this section with your school's information
        </p>,
        document.getElementById(topInvalidElementId)
      );
    }

    if (topInvalidElementId) {
      let topInvalidElement = document.getElementById(topInvalidElementId);

      if (topInvalidElement.className.indexOf('form-group') >= 0) {
        topInvalidElement.scrollIntoView();
      } else {
        topInvalidElement.parentElement.scrollIntoView();
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
      // TODO: modify state, render submitted on client side.
      window.location.reload(true);

    }).fail(data => {
      // TODO: render error message(s) nicely on client.
      alert(`error: ${data.responseJSON}`);
    });
  },

  renderSubmitButton() {
    return (
      <div>
        <p style={{fontSize: '16px', fontWeight: 'bold'}}>
          Code.org works closely with local Regional Partners to organize and deliver the Professional Learning Program.
          By clicking “Complete and Send,” you are agreeing to allow Code.org to share the information provided in this
          survey with your assigned Regional Partner and your school district.
        </p>
        <Button onClick={this.onSubmitButtonClick}>
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
          regionalPartnerGroup={this.props.regionalPartnerGroup}
          selectedCourse={this.state.selectedCourse}
          selectedState={document.getElementById('school-state').value}
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

export default TeacherApplication;
