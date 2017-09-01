import React, {Component} from 'react';
// import { connect } from 'react-redux';
import Checkbox from './forms/Checkbox';
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
  pledge: {
    marginTop: 50,
    marginBottom: 50
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
    value: ''
  };

  handleChange = event => {
    this.setState({value: event.target.value});
  }

  processResponse() {
    console.log("submission success!");
  }

  processError() {
    console.log("error submittiing");
  }

  censusFormSubmit() {

    $.ajax({
      url: "/forms/Census",
      type: "post",
      dataType: "json",
      data: $('#census-form').serialize()
    }).done(this.processResponse).fail(this.processError);

    event.preventDefault();
  }

  render() {
    const CSOptions = [
      i18n.none(),
      i18n.censusHocSome(),
      i18n.censusHocAll(),
      i18n.censusAfterSchoolSome(),
      i18n.censusAfterSchoolAll(),
      i18n.census10HourSome(),
      i18n.census10HourAll(),
      i18n.census20HourSome(),
      i18n.census20HourAll(),
      i18n.censusOtherCourse(),
      i18n.iDontKnow()
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

    return (
      <form id="census-form">
        <div style={{borderWidth: 1, borderColor: color.red, borderStyle: 'solid', padding: 10 }}>
          School Lookup goes here
        </div>
        <div style={styles.question}>
          {i18n.censusHowMuch()}
        </div>
        <div style={styles.options}>
          {CSOptions.map((label, index) =>
            <Checkbox
              name={label}
              label={label}
              key={index}
              handleCheckboxChange={() => console.log("checked the box!")}
            />
          )}
        </div>
        <label>
          <div style={styles.question}>
            {i18n.censusConnection()}
          </div>
          <select
            value={this.state.value}
            onChange={this.handleChange}
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
                {i18n.yourEmail()}
              </div>
              <input
                type="text"
                name="email_s"
                value={this.state.value}
                onChange={this.handleChange}
                placeholder={i18n.yourEmailPlaceholder()}
                style={styles.input}
              />
            </label>
          </div>
        </div>
        <div style={styles.pledge}>
          <Checkbox
            label={pledge}
            big={true}
            handleCheckboxChange={() => console.log("checked the box!")}
          />
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
