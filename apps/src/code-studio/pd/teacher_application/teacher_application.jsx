/**
 * Teacher Application questionaire
 */

import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import {Button, Radio, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import {otherString, ButtonList} from '../form_components/button_list.jsx';

const requiredStar = (<span style={{color: 'red'}}> *</span>);

function FieldGroup({ id, label, validationState, required, ...props }) {
  return (
    <FormGroup controlId={id} validationState={validationState}>
      <ControlLabel>{label}{required && requiredStar}</ControlLabel>
      <FormControl {...props} />
      <br/>
    </FormGroup>
  );
}

FieldGroup.propTypes = {
  id: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  validationState: React.PropTypes.string,
  required: React.PropTypes.bool
};

const grades = ['Kindergarten'].concat(_.map(_.range(1,13), x => x.toString()));
const subjects = ['Computer Science', 'Computer Literacy', 'Math', 'Science', 'History', 'English', 'Music', 'Art',
  'Multimedia', 'Foreign Language'];
const yesNoResponses = ['Yes', 'No'];
const beliefPoll = ['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree'];
const requiredFields = ['gradesAtSchool', 'firstName', 'lastName', 'schoolEmail', 'personalEmail',
  'phoneNumber', 'genderIdentity', 'grades2016', 'subjects2016','grades2017', 'subjects2017', 'principalFirstName',
  'principalLastName', 'principalPrefix', 'principalEmail', 'selectedCourse'];
const requiredCsdFields = ['csdGrades'];
const requiredCspFields = ['cspDuration', 'cspApCourse', 'cspGrades', 'cspApExamIntent'];
const requiredSurveyFields = ['committedToSummer', 'allStudentsShouldLearn', 'allStudentsCanLearn', 'newApproaches',
  'allAboutContent', 'allAboutProgramming', 'csCreativity', 'currentCsOpportunities', 'whyCsIsImportant',
  'whatTeachingSteps'];

const TeacherApplication = React.createClass({

  getInitialState() {
    return {

    };
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

  getRequiredValidationState(key) {
    if (this.state[key] !== undefined) {
      return this.state[key].length > 0 ? 'success' : 'error';
    }
  },

  generateTeacherInformationSection() {
    return (
      <div>
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
          validationState={this.getRequiredValidationState('firstName')}
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
          validationState={this.getRequiredValidationState('lastName')}
        />
        <FieldGroup
          id="schoolEmail"
          label="Your school email address"
          type="email"
          onChange={this.handleTextChange}
          required={true}
          validationState={this.getRequiredValidationState('schoolEmail')}
        />
        <FieldGroup
          id="personalEmail"
          label="Your personal email address (we may need to contact you during the summer)"
          type="email"
          onChange={this.handleTextChange}
          required={true}
          validationState={this.getRequiredValidationState('personalEmail')}
        />
        <FieldGroup
          id="phoneNumber"
          label="Preferred phone number"
          type="text"
          onChange={this.handleTextChange}
          required={true}
          validationState={this.getRequiredValidationState('phoneNumber')}
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
          label="What grades are you teaching in the current 2017-18 school year? (select all that apply)"
          groupName="grades2017"
          answers={grades}
          includeOther={true}
          onChange={this.handleCheckboxChange}
          selectedItems={this.state.grades2017}
          required={true}
          validationState={this.getRequiredValidationState('grades2017')}
        />
        <ButtonList
          type="check"
          label="What subjects are you teaching in the current 2017-18 school year? (select all that apply)"
          groupName="subjects2017"
          answers={subjects}
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
          validationState={this.getRequiredValidationState('principalFirstName')}
        />
        <FieldGroup
          id="principalLastName"
          label="Principal's last name"
          type="text"
          onChange={this.handleTextChange}
          required={true}
          validationState={this.getRequiredValidationState('principalLastName')}
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
          validationState={this.getRequiredValidationState('principalEmail')}
        />
      </div>
    );
  },

  renderCourseSelection() {
    return (
      <FormGroup id="selectedCourse" validationState={this.getRequiredValidationState('selectedCourse')}>
        <ControlLabel>
          Which professional learning program are you applying to join for the 2017-18 school year? Click on each
          curriculum for more information. Note: this application is only for Computer Science Discoveries and Computer
          Science Principles. If you are interested in <a href="">Computer Science Fundamentals</a>, please
          visit <a href="">this</a> page for information about workshops in your area. (Select one)
          {requiredStar}
        </ControlLabel>
        <Radio
          value="csd"
          name="courseSelection"
          onChange={this.handleCourseChange}
        >
          <a href="">Computer Science Discoveries</a> (designed for 7th - 9th grade)
        </Radio>
        <Radio
          value="csp"
          name="courseSelection"
          onChange={this.handleCourseChange}
        >
          <a href="">Computer Science Principles</a> (designed for 9th - 12th grade, and can be implemented as an AP or introductory course)
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
            groupName="csdGrades"
            answers={grades.slice(grades.indexOf('6'))}
            onChange={this.handleCheckboxChange}
            selectedItems={this.state.csdGrades}
            required={true}
            validationState={this.getRequiredValidationState('csdGrades')}
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
              'Introductory course',
              'AP course',
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
            groupName="cspGrades"
            onChange={this.handleCheckboxChange}
            selectedItems={this.state.cspGrades}
            required={true}
            validationState={this.getRequiredValidationState('cspGrades')}
          />
          <ButtonList
            type="radio"
            label="Is it your goal for your students to take the AP CSP exam in the spring of 2018? Note: even if CS
            Principles is taught as an introductory course, students are still eligible to take the AP CSP exam.
            (select one)"
            groupName="cspAPExamIntent"
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
            One five-day summer workshop in 2017
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

  renderSummerWorkshopSchedule() {
    return (
      <h2>
        This section is huge. Putting it off for now.
      </h2>
    );
  },

  renderComputerScienceBeliefsPoll() {
    const csBeliefsQuestions = {
      allStudentsShouldLearn: 'All students should have the opportunity to learn computer science in school',
      allStudentsCanLearn: 'All students can learn computer science',
      newApproaches: 'I am willing to learn new approaches to teaching in order to engage my students',
      allAboutContent: 'Effective teaching of computer science is all about knowing the content',
      allAboutProgramming: 'Computer science is all about programming',
      csCreativity: 'Computer science has a lot to do with problem solving and creativity'
    };

    return (
      <div>
        <ControlLabel>
          Please rate the following questions
        </ControlLabel>
        <table>
          <thead>
            <tr>
              <th/>
              <th>Strongly Disagree</th>
              <th>Disagree</th>
              <th>Agree</th>
              <th>Strongly Agree</th>
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(csBeliefsQuestions).map( (question, i) => {
                return (
                  <tr key={i}>
                    <td>
                      <FormGroup validationState={this.getRequiredValidationState(question)}>
                        <ControlLabel>
                          {csBeliefsQuestions[question]}
                        </ControlLabel>
                      </FormGroup>
                    </td>
                    {
                      _.times(4, (j) => {
                        return (
                          <td key={j}>
                            <Radio
                              name={question}
                              value={beliefPoll[j]}
                              checked={this.state[question] === beliefPoll[j]}
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
        <p style={{fontWeight: 'bold'}}>
          We would like to learn more about your school, and why you want to participate in our Professional Learning
          Program. Please share your responses to the following questions:
        </p>
        <ButtonList
          type="radio"
          label="What computer science opportunities currently exist at your school? (select all that apply)"
          groupName="currentCsOpportunities"
          answers={['Courses for credit', 'After school clubs', 'Lunch clubs', 'Hour of Code',
            'No computer science opportunities are currently available at my school']}
          includeOther={true}
          onChange={this.handleRadioButtonListChange}
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

  validateDistrictDropdown() {
    //The district dropdown is not a react component like the rest of this form's components.
    //That's why we're doing it separately here
    const districtValues = {
      ['us-or-international']: document.getElementById('us-or-international').value,
      ['school-type']: document.getElementById('school-type').value,
      ['school-state']: document.getElementById('school-state').value,
      ['school-district']: document.querySelector('#school-district input').value,
      ['school']: document.querySelector('#school input').value
    };

    if (document.getElementById('school-district-other').checked) {
      _.assign(districtValues, {
        ['school-district-name']: document.getElementById('school-district-name').value
      });
    }

    if (document.getElementById('school-district-other').checked ||
      document.getElementById('school-other').checked) {
      _.assign(districtValues, {
        ['school-name']: document.getElementById('school-name').value,
        ['school-zipcode']: document.getElementById('school-zipcode').value
      });
    }

    console.log('Getting from the district');
    console.log(districtValues);

    this.setState(districtValues);
  },

  onSubmitButtonClick() {
    this.validateDistrictDropdown();

    const formData = _.cloneDeep(this.state);
    let topInvalidElementId;

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

    if (topInvalidElementId) {
      document.getElementById(topInvalidElementId).parentElement.scrollIntoView();
    }
    console.log(formData);
    console.log(this.state);
  },

  renderSubmitButton() {
    return (
      <div>
        <Button onClick={this.onSubmitButtonClick}>
          Submit application
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
        {this.renderSummerProgramContent()}
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
