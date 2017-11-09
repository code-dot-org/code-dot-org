import React, { Component, PropTypes } from 'react';
import i18n from "@cdo/locale";
import { STATES } from '../geographyConstants';
import { styles } from './census2017/censusFormStyles';

const schoolTypes = [
  '',
  i18n.schoolTypeCharter(),
  i18n.schoolTypePrivate(),
  i18n.schoolTypePublic(),
  i18n.other()
];

export default class SchoolNotFound extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    schoolName: PropTypes.string,
    schoolCity: PropTypes.string,
    schoolState: PropTypes.string,
    schoolZip: PropTypes.string,
    schoolType: PropTypes.string,
    showErrorMsg: PropTypes.bool
  };

  handleChange = (field, event) => {
    this.props.onChange(field, event);
  }

  render() {

    return (
      <div>
        <div style={styles.question}>
          {i18n.schoolNotFoundDescription()}
          {this.props.showErrorMsg && (
            <div style={styles.errors}>
              {i18n.schoolInfoRequired()}
            </div>
          )}
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
                onChange={this.handleChange.bind(this, "schoolName")}
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
                onChange={this.handleChange.bind(this, "schoolType")}
                style={styles.schoolNotFoundDropdown}
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
                onChange={this.handleChange.bind(this, "schoolCity")}
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
                onChange={this.handleChange.bind(this, "schoolState")}
                style={styles.schoolNotFoundDropdown}
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
              onChange={this.handleChange.bind(this, "schoolZip")}
              style={styles.input}
            />
          </label>
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
}
