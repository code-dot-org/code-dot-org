import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button';
import color from "../../util/color";
import i18n from "@cdo/locale";
import _ from 'lodash';
import $ from 'jquery';
import {CSOptions, roleOptions, courseTopics, frequencyOptions, pledge} from './censusQuestions';
import '../../sites/studio/pages/schoolInfo';
import ProtectedStatefulDiv from '../../templates/ProtectedStatefulDiv';
require('selectize');

const styles = {
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  personalQuestion: {
    width: '33%',
    float: 'left'
  },
  personalQuestionsBox: {
    marginTop: 50
  },
  checkbox: {
    width: 25,
    height: 25,
    padding: 0,
    margin:0,
    verticalAlign: 'bottom',
    position: 'relative',
    top: -1,
    overflow: 'hidden',
  },
  pledgeBox: {
    marginTop: 50,
    marginBottom: 50
  },
  pledge: {
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.charcoal,
    paddingBottom: 10,
    paddingTop: 10
  },
  option: {
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
  thankYouBox: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 5,
    borderColor: color.light_green,
    background: color.lightest_green,
    padding: 10
  },
  errors: {
    fontSize: 14,
    fontFamily: '"Gotham 3r", sans-serif',
    color: color.red,
    paddingTop: 5,
    paddingBottom: 5
  }
};

class CensusForm extends Component {

  state = {
    showForm: true,
    showFollowUp: false,
    showThankYou: false,
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
    if (selected.includes("twenty_hr_some_b") || selected.includes("twenty_hr_all_b")) {
      return true;
    } else {
      return false;
    }
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
    console.log("submission success!");
  }

  processError(error) {
    console.log(JSON.stringify(error, null, 2));
  }

  validateEmail() {
    const emailError = this.state.submission.email.includes('@') ? false : true;
    return emailError;
  }

  validateHowMuchCS() {
    const howMuchCSError = this.state.selectedHowMuchCS.length === 0 ? true : false;
    return howMuchCSError;
  }

  validateTopics() {
    const topicsError = this.state.showFollowUp && this.state.selectedTopics.length === 0 ? true : false;
    return topicsError;
  }

  validateFrequency() {
    const frequencyError = this.state.showFollowUp && this.state.submission.followUpFrequency === '' ? true : false;
    return frequencyError;
  }

  validateSubmission() {
    this.setState({
      errors: {
        ...this.state.errors,
        email: this.validateEmail(),
        howMuchCS : this.validateHowMuchCS(),
        topics: this.validateTopics(),
        frequency: this.validateFrequency()
      }
    }, this.censusFormSubmit);
  }

  censusFormSubmit() {
    const { errors } = this.state;
    if (!errors.email && !errors.howMuchCS && !errors.topics && !errors.frequency) {
      this.setState({
        showForm: false,
        showThankYou: true,
      });
      $.ajax({
        url: "/forms/Census2017",
        type: "post",
        dataType: "json",
        data: $('#census-form').serialize()
      }).done(this.processResponse).fail(this.processError);
      event.preventDefault();
    }
  }

  render() {
    const { showForm, showFollowUp, showThankYou, submission, selectedHowMuchCS, selectedTopics, errors } = this.state;
    const showErrorMsg = errors.email || errors.howMuchCS || errors.topics || errors.frequency ? true : false;

    return (
      <div>
        {showForm && (
          <form id="census-form">
            <ProtectedStatefulDiv
              ref="schoolInfo"
            />
            <div style={styles.question}>
              {i18n.censusHowMuch()}
            </div>
            {errors.howMuchCS && (
              <div style={styles.errors}>
                required - please select an option
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
                      style={styles.checkbox}
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
                  {i18n.censusFollowUpHeading()}
                </div>
                <div style={styles.question}>
                  {i18n.censusFollowUpTopics()}
                </div>
                {errors.topics && (
                  <div style={styles.errors}>
                    required - please select an option
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
                          style={styles.checkbox}
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
                  </div>
                  {errors.frequency && (
                    <div style={styles.errors}>
                      required - please select an option
                    </div>
                  )}
                  <select
                    name="followup_frequency_s"
                    value={this.state.submission.followUpFrequency}
                    onChange={this.handleChange.bind(this, 'followUpFrequency')}
                    style={styles.option}
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
              </div>
              <select
                name="role_s"
                value={this.state.submission.role}
                onChange={this.handleChange.bind(this, 'role')}
                style={styles.option}
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
            <div style={styles.personalQuestionsBox}>
              <div style={styles.personalQuestion}>
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
              <div style={styles.personalQuestion}>
                <label>
                  <div style={styles.question}>
                    {i18n.yourEmail()}
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
                      email is required
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div style={styles.pledgeBox}>
              <label>
                <input
                  type="checkbox"
                  name="pledge_b"
                  checked={submission.acceptedPledge}
                  onChange={() => this.togglePledge()}
                  style={styles.checkbox}
                />
                <span style={styles.pledge}>
                  {pledge}
                </span>
              </label>
            </div>
            {showErrorMsg && (
                <div style={styles.errors}>
                  You are missing one or more required fields.
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
        )}
        {showThankYou && (
          <div style={styles.thankYouBox}>
            {i18n.censusThankYou()}
          </div>
        )}
      </div>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
