import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button';
import color from "../../util/color";
import i18n from "@cdo/locale";
import _ from 'lodash';
import $ from 'jquery';
import {CSOptions, roleOptions, courseTopics, frequencyOptions, pledge} from './censusQuestions';
import ProtectedStatefulDiv from '../../templates/ProtectedStatefulDiv';
require('selectize');

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
  option: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    marginLeft: 18
  },
  dropdown: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
  },
  options: {
    marginLeft: 35
  },
  input: {
    height: 30,
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
    });
  }

  togglePledge() {
    this.setState({
      submission: {
        ...this.state.submission,
        acceptedPledge: !this.state.submission.acceptedPledge
      }
    });
  }

  toggleHowMuchCS(option) {
    const selected = this.state.selectedHowMuchCS.slice(0);
    if (selected.includes(option)) {
      const newSelected = _.without(selected, option);
      this.setState({
        selectedHowMuchCS: newSelected,
        showFollowUp: this.checkShowFollowUp(newSelected)
      });
    } else {
      const newSelected = selected.concat(option);
      this.setState({
        selectedHowMuchCS: newSelected,
        showFollowUp: this.checkShowFollowUp(newSelected)
      });
    }
  }

  checkShowFollowUp(selected) {
    return (selected.includes("twenty_hr_some_b") || selected.includes("twenty_hr_all_b"));
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

// Here we're using the built-in functionality of pegasus form helpers to validate the email address.  It's the only server-side validation for this form; all other validations are done client-side before the POST request is submitted. This slightly atypical approach was done due to the short time frame available to complete the form.
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

  validateEmail() {
    return this.state.submission.email === '';
  }

  validateHowMuchCS() {
    return this.state.selectedHowMuchCS.length === 0;
  }

  validateRole() {
    return this.state.submission.role === '';
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
        email: this.validateEmail(),
        howMuchCS : this.validateHowMuchCS(),
        topics: this.validateTopics(),
        frequency: this.validateFrequency(),
        school: this.validateSchool(),
        role: this.validateRole()
      }
    }, this.censusFormSubmit);
  }

  censusFormSubmit() {
    const { errors } = this.state;
    if (!errors.email && !errors.howMuchCS && !errors.topics && !errors.frequency && !errors.school && !errors.role) {
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
    const { showFollowUp, submission, selectedHowMuchCS, selectedTopics, errors } = this.state;
    const showErrorMsg = !!(errors.email || errors.howMuchCS || errors.topics || errors.frequency || errors.school || errors.role);

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
            <span style={styles.asterisk}>*</span>
          </div>
          {errors.howMuchCS && (
            <div style={styles.errors}>
              {i18n.censusRequiredSelect()}
            </div>
          )}
          <div style={styles.options}>
            {CSOptions.map((CSOption, index) =>
              <div
                key={index}
                style={{leftMargin:20}}
              >
                <label>
                  <input
                    type="checkbox"
                    name={CSOption.name}
                    checked={selectedHowMuchCS.includes(CSOption.name)}
                    onChange={() => this.toggleHowMuchCS(CSOption.name)}
                  />
                  <span style={styles.option}>
                    {CSOption.label}
                  </span>
                </label>
              </div>
            )}
          </div>
          {showFollowUp && (
            <div>
              <div style={styles.question}>
                {i18n.censusFollowUp()}
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
                    style={{leftMargin:20}}
                  >
                    <label>
                      <input
                        type="checkbox"
                        name={courseTopic.name}
                        checked={selectedTopics.includes(courseTopic.name)}
                        onChange={() => this.toggleTopics(courseTopic.name)}
                      />
                      <span style={styles.option}>
                        {courseTopic.label}
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <label>
                <div style={styles.question}>
                  {i18n.censusFollowUpFrequency()}
                  <span style={styles.asterisk}>*</span>
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
                  style={styles.dropdown}
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
              <span style={styles.asterisk}>*</span>
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
              style={styles.dropdown}
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
                <span style={styles.asterisk}>*</span>
              </div>
              <input
                type="text"
                name="email_s"
                value={this.state.submission.email}
                onChange={this.handleChange.bind(this, 'email')}
                placeholder={i18n.yourEmailPlaceholder()}
                style={styles.input}
              />
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
