import React, { Component } from 'react';
import color from "../util/color";
// import i18n from "@cdo/locale";

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
    width: 400,
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
        <div>
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
        <div>
          <label>
            <div style={styles.question}>
              School State
            </div>
            <input
              type="text"
              name="school_state_s"
              value={this.state.schoolState}
              onChange={this.handleChange.bind(this, 'schoolState')}
              style={styles.input}
            />
          </label>
        </div>
        <div>
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
      </div>
    );
  }
}
