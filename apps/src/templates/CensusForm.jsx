import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Checkbox from './forms/Checkbox';
import {UnconnectedCensusFollowUp as CensusFollowUp} from './CensusFollowUp';
import Button from './Button';
import color from "../util/color";
import i18n from "@cdo/locale";
import '../sites/studio/pages/schoolInfo';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';
require('selectize');
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
    submission: {
      name: '',
      email: '',
      role: '',
      pledge: false,
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

  componentDidMount() {
    // Move the haml-rendered DOM section inside our protected stateful div
    $('#school-info').appendTo(ReactDOM.findDOMNode(this.refs.schoolInfo)).show();
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
        <ProtectedStatefulDiv
          ref="schoolInfo"
        />
        <div style={styles.question}>
          {i18n.censusHowMuch()}
        </div>
        <div style={styles.options}>
          {CSOptions.map((label, index) =>
            <Checkbox
              label={label}
              key={index}
              handleCheckboxChange={() => console.log("checked the box!")}
            />
          )}
        </div>
        <CensusFollowUp/>
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
        <div style={styles.pledge}>
          <Checkbox
            name="pledge_b"
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
