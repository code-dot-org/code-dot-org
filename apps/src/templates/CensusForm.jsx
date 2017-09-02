import React, {Component} from 'react';
import {UnconnectedCensusFollowUp as CensusFollowUp} from './CensusFollowUp';
import Button from './Button';
import color from "../util/color";
import i18n from "@cdo/locale";
import $ from 'jquery';

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
  }
};

class CensusForm extends Component {

  state = {
    submission: {
      name: '',
      email: '',
      role: '',
      pledge: false,
      selected: []
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
    const index = this.state.submission.selected.indexOf(option);
    if (index >= 0) {
      this.setState(previousState => {
        return { selected: previousState.submission.selected.splice(index, 1)};
      });
    } else {
      this.setState(previousState => {
        return { selected: previousState.submission.selected.push(option)};
      });
    }
  }

  togglePledge() {
    this.setState({
      submission: {
        ...this.state.submission,
        pledge: !this.state.submission.pledge
      }
    });
  }

  processResponse() {
    console.log("submission success!");
  }

  processError(error) {
    console.log(JSON.stringify(error, null, 2));
  }

  censusFormSubmit() {
    $.ajax({
      url: "/forms/Census2017",
      type: "post",
      dataType: "json",
      data: $('#census-form').serialize()
    }).done(this.processResponse).fail(this.processError);

    event.preventDefault();
  }

  render() {

    console.log("STATE:",
    this.state);

    const CSOptions = [{
      name: "cs_none_b",
      label: i18n.none()
    },
    {
      name: "hoc_some_b",
      label: i18n.censusHocSome()
    },
    {
      name: "hoc_all_b",
      label: i18n.censusHocAll()
    },
    {
      name: "after_school_some_b",
      label: i18n.censusAfterSchoolSome()
    },
    {
      name: "after_school_all_b",
      label: i18n.censusAfterSchoolAll()
    },
    {
      name: "10_hr_some_b",
      label: i18n.census10HourSome()
    },
    {
      name: "10_hr_all_b",
      label: i18n.census10HourAll()
    },
    {
      name: "20_hr_some_b",
      label: i18n.census20HourSome()
    },
    {
      name: "20_hr_all_b",
      label: i18n.census20HourAll()
    },
    {
      name: "other_course_b",
      label: i18n.censusOtherCourse()
    },
    {
      name: "cs_dont_know",
      label: i18n.iDontKnow()
    }
    ];

    const roleOptions = [
      i18n.teacher(),
      i18n.administrator(),
      i18n.parent(),
      i18n.student(),
      i18n.volunteer(),
      i18n.other(),
    ];

    const pledge = i18n.censusPledge();

    const showFollowUp = this.state.submission.selected.includes("20_hr_some_b") || this.state.submission.selected.includes("20_hr_all_b") ? true : false;

    return (
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
                  checked={this.state.submission.selected.includes(CSOption.name)}
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
          <CensusFollowUp/>
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
              checked={this.state.submission.pledge}
              onChange={() => this.togglePledge()}
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
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
