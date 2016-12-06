/* global window */

/**
 * Teacher Application questionaire
 */

import React from 'react';
import _ from 'lodash';
import {Radio, Checkbox, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';

function FieldGroup({ id, label, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
    </FormGroup>
  );
}

const grades = ['Kindergarten'].concat(_.range(1,13));
const subjects = ['Computer Science', 'Computer Literacy', 'Math', 'Science', 'History', 'English', 'Music', 'Art', 'Multimedia', 'Foreign Language'];
const yesNoResposes = ['Yes', 'No'];

const TeacherApplication = React.createClass({

  getInitialState() {
    return {
      selectedCourse: ''
    };
  },

  buttonList(type, label, groupName, answers, allowOther = false) {
    const options = answers.map( (answer, i) => {
      if (type === 'radio') {
        return (
          <Radio
            value={answer}
            label={answer}
            key={i}
            name={groupName}
          >
            {answer}
          </Radio>
        );
      } else if (type === 'check') {
        return (
          <Checkbox
            value={answer}
            label={answer}
            key={i}
            name={groupName}
          >
            {answer}
          </Checkbox>
        );
      }
    });

    if (allowOther) {
      const otherDiv = (
        <div style={{display: 'inline'}}>
          <span style={{marginRight: '5px'}}>
            Other:
          </span>
          <input type="text" id={groupName + 'Other'}/>
        </div>
      );

      if (type === 'radio') {
        options.push((
          <Radio
            key={answers.length + 1}
            name={groupName}
          >
            {otherDiv}
          </Radio>
        ));
      } else if (type === 'check') {
        options.push((
          <Checkbox
            key={answers.length + 1}
            name={groupName}
          >
            {otherDiv}
          </Checkbox>
        ));
      }
    }

    return (
      <div>
        <ControlLabel>
          {label}
        </ControlLabel>
        {options}
      </div>
    );
  },

  generateTeacherInformationSection() {
    return (
      <div>
        {this.buttonList('check', 'Grades served at your school', 'gradesAtSchool', grades)}
        <h2>
          Section 2: Teacher Information
        </h2>
        <FieldGroup
          id="firstName"
          label="First name"
          type="text"
        />
        <FieldGroup
          id="preferredFirstName"
          label="Preferred First Name"
          type="text"
        />
        <FieldGroup
          id="lastName"
          label="Last Name"
          type="text"
        />
        <FieldGroup
          id="schoolEmail"
          label="Your school email address"
          type="email"
        />
        <FieldGroup
          id="schoolEmail"
          label="Your personal email address (we may need to contact you during the summer)"
          type="email"
        />
        <FieldGroup
          id="phoneNumber"
          label="Preferred phone number"
          type="text"
        />
        {this.buttonList('radio', 'Gender Identity', 'genderIdentity', ['Female', 'Male', 'Other', 'Prefer not to answer'])}
        {this.buttonList('check', 'What grades are you teaching in the current 2016-17 school year? (select all that apply)', 'grades2016', grades)}
        {this.buttonList('check', 'What subjects are you teaching in the current 2016-17 school year? (select all that apply)', 'subjects2016', subjects, true)}
        {this.buttonList('check', 'What grades are you teaching in the current 2017-18 school year? (select all that apply)', 'grades2017', grades)}
        {this.buttonList('check', 'What subjects are you teaching in the current 2016-17 school year? (select all that apply)', 'subjects2017', subjects, true)}
        <FieldGroup
          id="principalFirstName"
          label="Principal's first name"
          type="text"
        />
        <FieldGroup
          id="principalLastName"
          label="Principal's last name"
          type="text"
        />
        <FormGroup>
          <ControlLabel>
            Principal's prefix
          </ControlLabel>
          <FormControl componentClass="select" id="principalPrefix">
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
          type="text"
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
          {this.buttonList(
            'check',
            'To which grades do you plan to teach CS Discoveries? Please note that the CS Discoveries Professional ' +
            'Learning Program is not available for grades K-5. (select all that apply)',
            'csdGrades',
            _.range(6,13)
          )}
        </div>
      );
    }
  },

  renderCSPSpecificContent() {
    if (this.state.selectedCourse === 'csp') {
      return (
        <div id="cspSpecificContent">
          {
            this.buttonList(
              'radio',
              'I will be teaching Computer Science Principles as a (select one):',
              'cspTeachingDuration',
              [
                'Year-long course (~180 contact hours)',
                'Semester-long course (~90 contact hours)',
                'Semester-long course on block scheduling (~180 contact hours)',
              ],
              true
            )
          }
          {
            this.buttonList(
              'radio',
              'I will be teaching Computer Science Principles as an (select one)',
              'cspTeachingAP',
              [
                'Introductory course',
                'AP course'
              ]
            )
          }
          {
            this.buttonList(
              'check',
              'To which grades do you plan to teach CS Principles? Please note that the CS Principles Professional ' +
              'Learning Program is not available for grades K-8. (select all that apply)',
              'cspGrades',
              _.range(9,13)
            )
          }
          {
            this.buttonList(
              'radio',
              'Is it your goal for your students to take the AP CSP exam in the spring of 2018? Note: even if CS ' +
              'Principles is taught as an introductory course, students are still eligible to take the AP CSP exam. ' +
              '(select one)',
              'cspAPIntent',
              yesNoResposes
            )
          }
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
          {
            this.buttonList(
              'radio',
              'Are you committed to participating in the entire program?',
              'commitedToSummer',
              yesNoResposes,
              true
            )
          }
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
                            <Radio name={question} value={question + '_' + i}/>
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
      </div>
    );
  },

  render() {
    return (
      <div>
        {this.generateTeacherInformationSection()}
        {this.renderCourseSelection()}
        {this.state.selectedCourse === 'csd' && this.renderCSDSpecificContent()}
        {this.state.selectedCourse === 'csp' && this.renderCSPSpecificContent()}
        {this.state.course && this.renderSummerProgramContent()}
        {this.renderComputerScienceBeliefsPoll()}
      </div>
    );
  }
});

export default TeacherApplication;
window.TeacherApplication = TeacherApplication;
