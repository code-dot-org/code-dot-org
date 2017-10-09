import React, { Component } from 'react';
import color from "../util/color";
// import i18n from "@cdo/locale";
import { STATES, schoolTypes } from './schoolDropdownOptions';

const styles = {
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 3r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  input: {
    height: 40,
    width: 250,
    fontFamily: '"Gotham 3r", sans-serif',
    padding: 5
  },
  dropdown: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    height: 30,
    marginTop: 5,
    width: 250
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
  field: {
    float: 'left',
    height: '80px',
    width: '450px',
  }
};

export default class SchoolNotFound extends Component {
  state = {
    schoolName: "",
    schoolCity: "",
    schoolState: "",
    schoolZip: ""
  };

  handleChange(propertyName, event) {
    this.setState({
      [propertyName]: event.target.value
    });
  }

  render() {

    return (
      <div>
        <div style={styles.question}>
          Sorry, we couldn't find your school. Please enter it below.
        </div>
        <div>
          <div style={styles.field}>
            <label>
              <div style={styles.question}>
                School Name
              </div>
              <input
                type="text"
                name="school_name_s"
                value={this.state.schoolName}
                onChange={this.handleChange.bind(this, 'schoolName')}
                placeholder="Central High School"
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.field}>
            <label>
              <div style={styles.question}>
                School Type
              </div>
              <select
                name="school_type_s"
                value={this.state.schoolType}
                onChange={this.handleChange.bind(this, 'schoolType')}
                style={styles.dropdown}
              >
                {schoolTypes.map((schoolType, index) =>
                  <option
                    value={schoolType}
                    key={index}
                  >
                    {schoolType}
                  </option>
                )}
              </select>
            </label>
          </div>
        </div>
        <div>
          <div style={styles.field}>
            <label>
              <div style={styles.question}>
                School City
              </div>
              <input
                type="text"
                name="school_city_s"
                value={this.state.schoolCity}
                onChange={this.handleChange.bind(this, 'schoolCity')}
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.field}>
            <label>
              <div style={styles.question}>
                School State
              </div>
              <select
                name="school_state_s"
                value={this.state.schoolState}
                onChange={this.handleChange.bind(this, 'schoolState')}
                style={styles.dropdown}
              >
                {STATES.map((state, index) =>
                  <option
                    value={state}
                    key={index}
                  >
                    {state}
                  </option>
                )}
              </select>
            </label>
          </div>
        </div>
        <div style={styles.field}>
          <label>
            <div style={styles.question}>
              School Postal Code
            </div>
            <input
              type="text"
              name="school_zip_s"
              value={this.state.schoolZip}
              onChange={this.handleChange.bind(this, 'schoolZip')}
              style={styles.input}
            />
          </label>
        </div>
        <div style={{width: '100%', clear: 'both'}}/>
      </div>
    );
  }
}
