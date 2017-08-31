import React, {Component} from 'react';
import Checkbox from './forms/Checkbox';
import Button from './Button';
import color from "../util/color";
import i18n from "@cdo/locale";

const styles = {
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  definition:{
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
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
  checkbox: {
    width: 25,
    height: 25,
    marginTop: -2,
    paddingRight: 5,
  },
  input: {
    height: 30,
    width: 250,
    fontFamily: '"Gotham 3r", sans-serif',
    padding: 5
  }
};

class CensusForm extends Component{

  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('You clicked submit!');
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
      <form onSubmit={this.handleSubmit}>
        <div style={styles.definition}>
          {i18n.censusCSdefinition()}
        </div>
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
        <div>
          <div style={{width:'33%', float: 'left'}}>
            <label>
              <div style={styles.question}>
                {i18n.yourName()}
              </div>
              <input
                type="text"
                value={this.state.value}
                onChange={this.handleChange}
                placeholder={i18n.yourName()}
                style={styles.input}
              />
            </label>
          </div>
          <div style={{width:'33%', float: 'left'}}>
            <label>
              <div style={styles.question}>
                {i18n.yourEmail()}
              </div>
              <input
                type="text"
                value={this.state.value}
                onChange={this.handleChange}
                placeholder={i18n.yourEmailPlaceholder()}
                style={styles.input}
              />
            </label>
          </div>
        </div>
        <div style={{marginTop:50}}>
          <Checkbox
            label={pledge}
            big={true}
            handleCheckboxChange={() => console.log("checked the box!")}
          />
        </div>
        <Button
          onClick={() => this.handleSubmit()}
          color={Button.ButtonColor.orange}
          text={i18n.submit()}
          size={Button.ButtonSize.large}
        />
      </form>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
