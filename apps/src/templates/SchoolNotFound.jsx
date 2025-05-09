import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import {STATES} from '../geographyConstants';

import {styles} from './census/censusFormStyles';

const schoolTypes = [
  '',
  i18n.schoolTypeCharter(),
  i18n.schoolTypePrivate(),
  i18n.schoolTypePublic(),
  i18n.other(),
];

const OMIT_FIELD = '__omit_field__';

export default class SchoolNotFound extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    schoolName: PropTypes.string,
    schoolCity: PropTypes.string,
    schoolState: PropTypes.string,
    schoolZip: PropTypes.string,
    schoolType: PropTypes.string,
    fieldNames: PropTypes.object,
    showErrorMsg: PropTypes.bool,
    schoolNameLabel: PropTypes.string,
  };

  static defaultProps = {
    schoolNameLabel: i18n.schoolName(),
    fieldNames: {
      schoolName: 'school_name_s',
      schoolType: 'school_type_s',
      schoolCity: 'school_city_s',
      schoolState: 'school_state_s',
      schoolZip: 'school_zip_s',
      googleLocation: 'registration_location',
    },
  };

  static OMIT_FIELD = OMIT_FIELD;

  handleChange = (field, event) => {
    this.props.onChange(field, event);
  };

  isNotBlank(value) {
    return value && value !== '';
  }

  isFieldValid(fieldValue) {
    if (OMIT_FIELD === fieldValue || this.isNotBlank(fieldValue)) {
      return true;
    } else {
      return false;
    }
  }

  isValid() {
    if (
      !this.isFieldValid(this.props.schoolName) ||
      !this.isFieldValid(this.props.schoolType)
    ) {
      return false;
    }

    return (
      this.isFieldValid(this.props.schoolCity) &&
      this.isFieldValid(this.props.schoolState) &&
      this.isFieldValid(this.props.schoolZip)
    );
  }

  renderLabel(text, isLabelRequired = true) {
    return (
      <div style={styles.question}>
        {text}
        {isLabelRequired && <span style={styles.asterisk}> *</span>}
      </div>
    );
  }

  render() {
    const showError = this.props.showErrorMsg && !this.isValid();
    const errorDiv = (
      <div style={styles.errors}>{i18n.schoolInfoRequired()}</div>
    );

    return (
      <div>
        <div style={styles.question}>
          {i18n.schoolNotFoundDescription()}
          {showError && errorDiv}
        </div>
        <div>
          {this.props.schoolName !== OMIT_FIELD && (
            <div style={styles.field}>
              <label>
                {this.renderLabel(this.props.schoolNameLabel, false)}
                <input
                  id="school_name"
                  type="text"
                  name={this.props.fieldNames.schoolName}
                  value={this.props.schoolName}
                  onChange={this.handleChange.bind(this, 'schoolName')}
                  style={styles.input}
                />
              </label>
            </div>
          )}
          {this.props.schoolType !== OMIT_FIELD && (
            <div style={styles.field}>
              <label>
                {this.renderLabel(i18n.schoolType(), false)}
                <select
                  id="school_type"
                  name={this.props.fieldNames.schoolType}
                  value={this.props.schoolType}
                  onChange={this.handleChange.bind(this, 'schoolType')}
                  style={styles.schoolNotFoundDropdown}
                >
                  {schoolTypes.map((schoolType, index) => (
                    <option value={schoolType} key={index}>
                      {schoolType}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
        <div>
          {this.props.schoolCity !== OMIT_FIELD && (
            <div style={styles.field}>
              <label>
                {this.renderLabel(i18n.schoolCity())}
                <input
                  id="school_city"
                  type="text"
                  name={this.props.fieldNames.schoolCity}
                  value={this.props.schoolCity}
                  onChange={this.handleChange.bind(this, 'schoolCity')}
                  style={styles.input}
                />
              </label>
            </div>
          )}
          {this.props.schoolState !== OMIT_FIELD && (
            <div style={styles.field}>
              <label>
                {this.renderLabel(i18n.schoolState())}
                <select
                  id="school_state"
                  name={this.props.fieldNames.schoolState}
                  value={this.props.schoolState}
                  onChange={this.handleChange.bind(this, 'schoolState')}
                  style={styles.schoolNotFoundDropdown}
                >
                  {STATES.map((state, index) => (
                    <option value={state} key={index}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
        {this.props.schoolZip !== OMIT_FIELD && (
          <div style={styles.field}>
            <label>
              {this.renderLabel(i18n.schoolZip())}
              <input
                id="school_zipcode"
                type="text"
                name={this.props.fieldNames.schoolZip}
                value={this.props.schoolZip}
                onChange={this.handleChange.bind(this, 'schoolZip')}
                style={styles.input}
              />
            </label>
          </div>
        )}
        <div style={styles.clear} />
      </div>
    );
  }
}
