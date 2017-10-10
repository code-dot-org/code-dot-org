import React, { Component } from 'react';
import color from "../util/color";
import i18n from "@cdo/locale";
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
  field: {
    float: 'left',
    height: '80px',
    width: '450px',
  },
  clear: {
    width: '100%',
    clear: 'both'
  },
  asterisk: {
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red,
  },
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
          {i18n.schoolNotFoundDescription()}
        </div>
        <div>
          <div style={styles.field}>
            <label>
              <div style={styles.question}>
                {i18n.schoolName()}
                <span style={styles.asterisk}> *</span>
              </div>
              <input
                type="text"
                name="school_name_s"
                value={this.state.schoolName}
                onChange={this.handleChange.bind(this, 'schoolName')}
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.field}>
            <label>
              <div style={styles.question}>
                {i18n.schoolType()}
                <span style={styles.asterisk}> *</span>
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
                {i18n.schoolCity()}
                <span style={styles.asterisk}> *</span>
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
                {i18n.schoolState()}
                <span style={styles.asterisk}> *</span>
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
              {i18n.schoolZip()}
              <span style={styles.asterisk}> *</span>
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
        <div style={styles.clear}/>
      </div>
    );
  }
}
