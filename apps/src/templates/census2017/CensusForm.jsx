import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button';
import color from "../../util/color";
import i18n from "@cdo/locale";
import _ from 'lodash';
import $ from 'jquery';
import {howManyStudents, roleOptions, courseTopics, frequencyOptions, pledge} from './censusQuestions';
import ProtectedStatefulDiv from '../../templates/ProtectedStatefulDiv';

const styles = {
  formHeading: {
    marginTop: 20
  },
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  pledgeBox: {
    marginBottom: 20,
    marginTop: 20
  },
  pledge: {
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.charcoal,
    paddingBottom: 10,
    paddingTop: 10,
    marginLeft: 18,
  },
  otherCS : {
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    paddingBottom: 20,
    paddingTop: 10,
    marginLeft: 18,
  },
  option: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    float: 'left',
    width: '80%',
    marginRight: 20,
    marginLeft: 20
  },
  dropdown: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    height: 30,
    width: 120,
    marginLeft: 18,
    marginTop: 5
  },
  wideDropdown : {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    height: 30,
  },
  dropdownBox: {
    width: '100%'
  },
  options: {
    marginLeft: 18
  },
  checkboxOption: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    marginLeft: 20
  },
  input: {
    height: 40,
    width: 250,
    fontFamily: '"Gotham 3r", sans-serif',
    padding: 5
  },
  textArea: {
    height: 100,
    width: '100%',
    fontFamily: '"Gotham 3r", sans-serif',
    padding: 5
  },
  firstQuestion: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10
  },
  grayQuestion: {
    background: color.background_gray,
    padding: 15
  },
  errors: {
    fontSize: 14,
    fontFamily: '"Gotham 3r", sans-serif',
    color: color.red,
    paddingTop: 5,
    paddingBottom: 5
  },
  asterisk: {
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red,
  },
  leftMargin: {
    leftMargin: 20
  }
};

class CensusForm extends Component {

  state = {
    showFollowUp: false,
    selectedHowMuchCS: [],
    selectedTopics: [],
    submission: {
      name: '',
      email: '',
      role: '',
      hoc: '',
      afterSchool: '',
      tenHours: '',
      twentyHours: '',
      otherCS: false,
      followUpFrequency: '',
      followUpMore: '',
      acceptedPledge: false
    },
    errors: {
      invalidEmail: false
    }
  };

  componentDidMount() {
    // Move the haml-rendered DOM section inside our protected stateful div
    $('#school-info').appendTo(ReactDOM.findDOMNode(this.refs.schoolInfo)).show();
  }

  handleChange(propertyName, event) {
    this.setState({
      submission: {
        ...this.state.submission,
        [propertyName]: event.target.value
      }
    }, this.checkShowFollowUp);
  }

  togglePledge() {
    this.setState({
      submission: {
        ...this.state.submission,
        acceptedPledge: !this.state.submission.acceptedPledge
      }
    });
  }

  toggleOtherCS() {
    this.setState({
      submission: {
        ...this.state.submission,
        otherCS: !this.state.submission.otherCS
      }
    });
  }

  checkShowFollowUp() {
    const twentyHours = this.state.submission.twentyHours;
    this.setState({
      showFollowUp: (twentyHours === 'Some' || twentyHours === 'All')
    });
  }

  toggleTopics(option) {
     const selected = this.state.selectedTopics.slice(0);
     if (selected.includes(option)) {
       this.setState({
         selectedTopics: _.without(selected, option)
       });
     } else {
       this.setState({
         selectedTopics: selected.concat(option)
       });
     }
   }

  processResponse() {
    window.location.href = "/yourschool/thankyou";
  }

// Here we're using the built-in functionality of pegasus form helpers to validate the email address.  It's the only server-side validation for this form; all other validations are done client-side before the POST request is submitted. This slightly atypical approach because the logic for email validation is more complex and there wasn't a need to duplicate what already exists; the other validations are much more straightforward to simply implement here in the React.
  processError(error) {
    if (error.responseJSON.email_s[0] === "invalid") {
      this.setState({
        errors: {
          ...this.state.errors,
          invalidEmail: true
        }
      });
    }
  }

  validateSchool() {
    if ($("#school-country").val() === "US") {
      if (($("#school-id").val()) ||  ($("#school-name").val() && $("#school-zipcode").val())) {
        return false;
      } else {
      return true;
      }
    } else {
    return false;
    }
  }

  validateNotBlank(questionField) {
    return questionField === '';
  }

  validateTopics() {
    return this.state.showFollowUp && this.state.selectedTopics.length === 0;
  }

  validateFrequency() {
    return this.state.showFollowUp && this.state.submission.followUpFrequency === '';
  }

  validateSubmission() {
    this.setState({
      errors: {
        ...this.state.errors,
        email: this.validateNotBlank(this.state.submission.email),
        topics: this.validateTopics(),
        frequency: this.validateFrequency(),
        school: this.validateSchool(),
        role: this.validateNotBlank(this.state.submission.role),
        hoc: this.validateNotBlank(this.state.submission.hoc),
        afterSchool: this.validateNotBlank(this.state.submission.afterSchool),
        tenHours: this.validateNotBlank(this.state.submission.tenHours),
        twentyHours: this.validateNotBlank(this.state.submission.twentyHours)
      }
    }, this.censusFormSubmit);
  }

  censusFormSubmit() {
    const { errors } = this.state;
    if (!errors.email && !errors.topics && !errors.frequency && !errors.school && !errors.role && !errors.hoc && !errors.afterSchool && !errors.tenHours && !errors.twentyHours) {
      $.ajax({
        url: "/forms/Census2017",
        type: "post",
        dataType: "json",
        data: $('#census-form').serialize()
      }).done(this.processResponse).fail(this.processError.bind(this));
      event.preventDefault();
    }
  }

  render() {
    const { showFollowUp, submission, selectedTopics, errors } = this.state;
    const showErrorMsg = !!(errors.email || errors.topics || errors.frequency || errors.school || errors.role || errors.hoc || errors.afterSchool || errors.tenHours || errors.twentyHours);

    return (
      <div>
        <h2 style={styles.formHeading}>
          {i18n.yourSchoolTellUs()}
        </h2>
        <form id="census-form">
          {errors.school && (
             <div style={styles.errors}>
               {i18n.censusRequiredSchool()}
             </div>
           )}
          <ProtectedStatefulDiv
            ref="schoolInfo"
          />
          <div style={styles.question}>
            {i18n.censusHowMuch()}
            <span style={styles.asterisk}> *</span>
          </div>
          <div style={styles.firstQuestion}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyHoC()}
                {errors.hoc && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="hoc_s"
                value={this.state.submission.hoc}
                onChange={this.handleChange.bind(this, 'hoc')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role}
                    key={index}
                  >
                    {role}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={styles.grayQuestion}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyAfterSchool()}
                {errors.afterSchool && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="after_school_s"
                value={this.state.submission.afterSchool}
                onChange={this.handleChange.bind(this, 'afterSchool')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role}
                    key={index}
                  >
                    {role}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={{padding: 15, margin: 10}}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyTenHours()}
                {errors.tenHours && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="ten_hours_s"
                value={this.state.submission.tenHours}
                onChange={this.handleChange.bind(this, 'tenHours')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role}
                    key={index}
                  >
                    {role}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={styles.grayQuestion}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyTwentyHours()}
                {errors.twentyHours && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="twenty_hours_s"
                value={this.state.submission.twentyHours}
                onChange={this.handleChange.bind(this, 'twentyHours')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role}
                    key={index}
                  >
                    {role}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={{marginTop: 20}}>
            <label>
              <input
                type="checkbox"
                name="otherCS_b"
                checked={submission.otherCS}
                onChange={() => this.toggleOtherCS()}
              />
              <span style={styles.otherCS}>
                {i18n.censusOtherCourse()}
              </span>
            </label>
          </div>
          {showFollowUp && (
            <div>
              <div style={styles.question}>
                {i18n.censusFollowUp()}
                <span style={styles.asterisk}> *</span>
              </div>
              {errors.topics && (
                <div style={styles.errors}>
                  {i18n.censusRequiredSelect()}
                </div>
              )}
              <div style={styles.options}>
                {courseTopics.map((courseTopic, index) =>
                  <div
                    key={index}
                    style={styles.leftMargin}
                  >
                    <label>
                      <input
                        type="checkbox"
                        name={courseTopic.name}
                        checked={selectedTopics.includes(courseTopic.name)}
                        onChange={() => this.toggleTopics(courseTopic.name)}
                      />
                      <span style={styles.checkboxOption}>
                        {courseTopic.label}
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <label>
                <div style={styles.question}>
                  {i18n.censusFollowUpFrequency()}
                  <span style={styles.asterisk}> *</span>
                </div>
                {errors.frequency && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
                <select
                  name="followup_frequency_s"
                  value={this.state.submission.followUpFrequency}
                  onChange={this.handleChange.bind(this, 'followUpFrequency')}
                  style={styles.wideDropdown}
                >
                  {frequencyOptions.map((role, index) =>
                    <option
                      value={role}
                      key={index}
                    >
                      {role}
                    </option>
                  )}
                </select>
              </label>
              <label>
                <div style={styles.question}>
                  {i18n.censusFollowUpTellUsMore()}
                </div>
                <textarea
                  type="text"
                  name="followup_more_s"
                  value={this.state.submission.followUpMore}
                  onChange={this.handleChange.bind(this, 'followUpMore')}
                  style={styles.textArea}
                />
              </label>
            </div>
          )}
          <label>
            <div style={styles.question}>
              {i18n.censusConnection()}
              <span style={styles.asterisk}> *</span>
            </div>
            {errors.role && (
              <div style={styles.errors}>
                {i18n.censusRequiredSelect()}
              </div>
            )}
            <select
              name="role_s"
              value={this.state.submission.role}
              onChange={this.handleChange.bind(this, 'role')}
              style={styles.wideDropdown}
            >
              {roleOptions.map((role, index) =>
                <option
                  value={role}
                  key={index}
                >
                  {role}
                </option>
              )}
            </select>
          </label>
          <div>
            <label>
              <div style={styles.question}>
                {i18n.yourEmail()}
                <span style={styles.asterisk}> *</span>
              </div>
              {errors.email && (
                <div style={styles.errors}>
                  {i18n.censusRequiredEmail()}
                </div>
              )}
              {errors.invalidEmail && (
                <div style={styles.errors}>
                  {i18n.censusInvalidEmail()}
                </div>
              )}
              <input
                type="text"
                name="email_s"
                value={this.state.submission.email}
                onChange={this.handleChange.bind(this, 'email')}
                placeholder={i18n.yourEmailPlaceholder()}
                style={styles.input}
              />
            </label>
          </div>
          <div>
            <label>
              <div style={styles.question}>
                {i18n.yourName()}
              </div>
              <input
                type="text"
                name="name_s"
                value={this.state.submission.name}
                onChange={this.handleChange.bind(this, 'name')}
                placeholder={i18n.yourName()}
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.pledgeBox}>
            <label>
              <input
                type="checkbox"
                name="pledge_b"
                checked={submission.acceptedPledge}
                onChange={() => this.togglePledge()}
              />
              <span style={styles.pledge}>
                {pledge}
              </span>
            </label>
          </div>
            {showErrorMsg && (
              <div style={styles.errors}>
                {i18n.censusRequired()}
              </div>
            )}
          <Button
            id="submit-button"
            onClick={() => this.validateSubmission()}
            color={Button.ButtonColor.orange}
            text={i18n.submit()}
            size={Button.ButtonSize.large}
          />
        </form>
      </div>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
