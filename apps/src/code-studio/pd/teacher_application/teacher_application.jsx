/**
 * Teacher Application questionaire
 */

import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import {Button, Radio, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import {otherString, ButtonList} from '../form_components/button_list.jsx';

function FieldGroup({ id, label, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      <br/>
    </FormGroup>
  );
}

FieldGroup.propTypes = {
  id: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired
};

const grades = ['Kindergarten'].concat(_.map(_.range(1,13), x => x.toString()));
const subjects = ['Computer Science', 'Computer Literacy', 'Math', 'Science', 'History', 'English', 'Music', 'Art', 'Multimedia', 'Foreign Language'];
const yesNoResponses = ['Yes', 'No'];
const beliefPoll = ['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree'];

const TeacherApplication = React.createClass({

  getInitialState() {
    return {
      selectedCourse: ''
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
        />
        <h2>
          Section 2: Teacher Information
        </h2>
        <FieldGroup
          id="firstName"
          label="First name"
          type="text"
          onChange={this.handleTextChange}
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
        />
        <FieldGroup
          id="schoolEmail"
          label="Your school email address"
          type="email"
          onChange={this.handleTextChange}
        />
        <FieldGroup
          id="personalEmail"
          label="Your personal email address (we may need to contact you during the summer)"
          type="email"
          onChange={this.handleTextChange}
        />
        <FieldGroup
          id="phoneNumber"
          label="Preferred phone number"
          type="text"
          onChange={this.handleTextChange}
        />
        <ButtonList
          type="radio"
          label="Gender Identity"
          groupName="genderIdentity"
          answers={["Female", "Male", "Other", "Prefer not to answer"]}
          onChange={this.handleRadioButtonListChange}
          selectedItems={this.state.genderIdentity}
        />
        <ButtonList
          type="check"
          label="What grades are you teaching in the current 2016-17 school year? (select all that apply)"
          groupName="grades2016"
          answers={grades}
          includeOther={true}
          onChange={this.handleCheckboxChange}
          selectedItems={this.state.grades2016}
        />
        <ButtonList
          type="check"
          label="What subjects are you teaching in the current 2016-17 school year? (select all that apply)"
          groupName="subjects2016"
          answers={subjects}
          includeOther={true}
          onChange={this.handleCheckboxChange}
          selectedItems={this.state.subjects2016}
        />
        <ButtonList
          type="check"
          label="What grades are you teaching in the current 2017-18 school year? (select all that apply)"
          groupName="grades2017"
          answers={grades}
          includeOther={true}
          onChange={this.handleCheckboxChange}
          selectedItems={this.state.grades2017}
        />
        <ButtonList
          type="check"
          label="What subjects are you teaching in the current 2017-18 school year? (select all that apply)"
          groupName="subjects2017"
          answers={subjects}
          includeOther={true}
          onChange={this.handleCheckboxChange}
          selectedItems={this.state.subjects2017}
        />
        <FieldGroup
          id="principalFirstName"
          label="Principal's first name"
          type="text"
          onChange={this.handleTextChange}
        />
        <FieldGroup
          id="principalLastName"
          label="Principal's last name"
          type="text"
          onChange={this.handleTextChange}
        />
        <FormGroup>
          <ControlLabel>
            Principal's prefix
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
        />
      </div>
    );
  },

  renderCourseSelection() {
    return (
      <div>
        <ControlLabel>
          Which professional learning program are you applying to join for the 2017-18 school year? Click on each
          curriculum for more information. Note: this application is only for Computer Science Discoveries and Computer
          Science Principles. If you are interested in <a href="">Computer Science Fundamentals</a>, please
          visit <a href="">this</a> page for information about workshops in your area. (Select one)
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
      </div>
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
          />
          <ButtonList
            type="radio"
            label="I will be teaching Computer Science Principles as an (select one)"
            answers={[
              'Introductory course',
              'AP course',
            ]}
            groupName="cspAPcourse"
            onChange={this.handleRadioButtonListChange}
            selectedItems={this.state.cspAPcourse}
          />
          <ButtonList
            type="check"
            label="To which grades do you plan to teach CS Principles? Please note that the CS Principles Professional
            Learning Program is not available for grades K-8. (select all that apply)"
            answers={grades.slice(grades.indexOf('9'))}
            groupName="cspGrades"
            onChange={this.handleCheckboxChange}
            selectedItems={this.state.cspGrades}
          />
          <ButtonList
            type="radio"
            label="Is it your goal for your students to take the AP CSP exam in the spring of 2018? Note: even if CS
            Principles is taught as an introductory course, students are still eligible to take the AP CSP exam.
            (select one)"
            groupName="cspAPExamIntent"
            answers={yesNoResponses}
            onChange={this.handleRadioButtonListChange}
            selectedItems={this.state.cspAPExamIntent}
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
                    <td>{csBeliefsQuestions[question]}</td>
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
        />
        <FieldGroup
          id="whyCsIsImportant"
          label="Why do you believe access to computer science education is important for your students?"
          componentClass="textarea"
          onChange={this.handleTextChange}
          style={{width: '100%'}}
          rows={4}
        />
        <FieldGroup
          id="whatTeachingSteps"
          label="What steps will you and your school need to take to ensure that enough students enroll in your computer
           science course(s) to keep the course(s) on the master schedule?"
          componentClass="textarea"
          onChange={this.handleTextChange}
          style={{width: '100%'}}
          rows={4}
        />
      </div>
    );
  },

  onSubmitButtonClick() {
    /*
    If we see Other String, then replace it with the value of the input control in the script
     */
    const formData = _.cloneDeep(this.state);

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
  },

  renderSubmitButton() {
    return (
      <div>
        <Button type="submit" onClick={this.onSubmitButtonClick}>
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
        <form>
          {this.generateTeacherInformationSection()}
          <hr/>
          {this.renderCourseSelection()}
          <hr/>
          {this.state.selectedCourse && this.renderAfterCourseSelectionSection()}
          {this.renderSubmitButton()}
        </form>
      </div>
    );
  }
});

export default TeacherApplication;
