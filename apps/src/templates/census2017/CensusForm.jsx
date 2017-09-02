import React, {Component} from 'react';
import Button from '../Button';
import color from "../../util/color";
import i18n from "@cdo/locale";
import $ from 'jquery';
import {CSOptions, roleOptions, courseTopics, frequencyOptions, pledge} from './censusQuestions';

const styles = {
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  personalQuestion: {
    width:'33%',
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
    display: 'none',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.green,
    padding: 10
  }
};

class CensusForm extends Component {

  state = {
    selected: [],
    submission: {
      name: '',
      email: '',
      role: '',
      followUpFrequency: '',
      followUpMore: ''
    }
  };

  handleChange(propertyName, event) {
    this.setState({
      submission: {
        ...this.state.submission,
        [propertyName]: event.target.value
      }
    });
  }

  toggle(option) {
    const index = this.state.selected.indexOf(option);
    if (index >= 0) {
      this.setState(previousState => {
        selected: previousState.selected.splice(index, 1);
      });
    } else {
      this.setState(previousState => {
        selected: previousState.selected.push(option);
      });
    }
  }

  processResponse() {
    console.log("submission success!");
  }

  processError(error) {
    console.log(JSON.stringify(error, null, 2));
  }

  censusFormSubmit() {
    $('#census-form').hide();
    $('#thank-you').show();
    $.ajax({
      url: "/forms/Census2017",
      type: "post",
      dataType: "json",
      data: $('#census-form').serialize()
    }).done(this.processResponse).fail(this.processError);
    event.preventDefault();
  }

  render() {
    const { selected } = this.state;

    console.log("STATE:",
    this.state);

    const showFollowUp = selected.includes("twenty_hr_some_b") || selected.includes("twenty_hr_all_b") ? true : false;

    return (
      <div>
        <form id="census-form">
          <div style={{borderWidth: 1, borderColor: color.red, borderStyle: 'solid', padding: 10 }}>
            School Lookup goes here
          </div>
          <div style={styles.question}>
            {i18n.censusHowMuch()}
          </div>
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
                    checked={selected.includes(CSOption.name)}
                    onChange={() => this.toggle(CSOption.name)}
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
                        checked={selected.includes(courseTopic.name)}
                        onChange={() => this.toggle(courseTopic.name)}
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
                <select
                  name="followUpFrequency_s"
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
                  name="followUpMore_s"
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
              </label>
            </div>
          </div>
          <div style={styles.pledgeBox}>
            <label>
              <input
                type="checkbox"
                name="pledge_b"
                checked={selected.includes("pledge_b")}
                onChange={() => this.toggle("pledge_b")}
                style={styles.checkbox}
              />
              <span style={styles.pledge}>
                {pledge}
              </span>
            </label>
          </div>
          <Button
            id="submit-button"
            onClick={() => this.censusFormSubmit()}
            color={Button.ButtonColor.orange}
            text={i18n.submit()}
            size={Button.ButtonSize.large}
          />
        </form>
        <div
          id="thank-you"
          style={styles.thankYouBox}
        >
          Thank you for your submission!
        </div>
      </div>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
