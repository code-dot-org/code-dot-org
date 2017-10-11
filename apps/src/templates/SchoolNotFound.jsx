import React, { Component, PropTypes } from 'react';
import color from "../util/color";
import i18n from "@cdo/locale";
import { STATES } from '../geographyConstants';

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
  static propTypes = {
    setField: PropTypes.func,
    schoolName: PropTypes.string,
    schoolCity: PropTypes.string,
    schoolState: PropTypes.string,
    schoolZip: PropTypes.string,
    schoolType: PropTypes.string
  };

  sendNameToParent = (event) => {
    this.props.setField("schoolName", event.target.value);
  }

  sendTypeToParent = (event) => {
    this.props.setField("schoolType", event.target.value);
  }

  sendStateToParent = (event) => {
    this.props.setField("schoolState", event.target.value);
  }

  sendZipToParent = (event) => {
    this.props.setField("schoolZip", event.target.value);
  }

  sendCityToParent = (event) => {
    this.props.setField("schoolCity", event.target.value);
  }

  render() {
    const schoolTypes = [
      '',
      i18n.schoolTypeCharter(),
      i18n.schoolTypePrivate(),
      i18n.schoolTypePublic(),
      i18n.other()
    ];

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
                id="school_name"
                type="text"
                name="school_name_s"
                value={this.props.schoolName}
                onChange={this.sendNameToParent}
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
                value={this.props.schoolType}
                onChange={this.sendTypeToParent}
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
                value={this.props.schoolCity}
                onChange={this.sendCityToParent}
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
                value={this.props.schoolState}
                onChange={this.sendStateToParent}
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
              id="school_zipcode"
              type="text"
              name="school_zip_s"
              value={this.props.schoolZip}
              onChange={this.sendZipToParent}
              style={styles.input}
            />
          </label>
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
}
