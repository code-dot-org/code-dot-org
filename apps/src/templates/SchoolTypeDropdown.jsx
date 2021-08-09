import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';

export default class SchoolTypeDropdown extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    country: PropTypes.string,
    fieldName: PropTypes.string,
    showRequiredIndicator: PropTypes.bool,
    showErrorMsg: PropTypes.bool
  };

  static defaultProps = {
    value: '',
    fieldName: 'user[school_info_attributes][school_type]'
  };

  render() {
    const showError = this.props.showErrorMsg && !this.props.value;
    const errorDiv = (
      <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
    );

    let countryIsUS = false;
    if (this.props.country && this.props.country === 'United States') {
      countryIsUS = true;
    }

    return (
      <div>
        <div style={styles.singleLineContainerStyles}>
          <div style={styles.singleLineLayoutStyles}>
            {i18n.signupFormSchoolType()}
            {this.props.showRequiredIndicator && countryIsUS && (
              <span style={styles.asterisk}> *</span>
            )}
          </div>
          <select
            id="school-type"
            name={this.props.fieldName}
            type="select"
            onChange={this.props.onChange}
            value={this.props.value}
            style={styles.selectStyle}
          >
            <option disabled={true} value="" />
            <option value="charter">{i18n.schoolTypeCharter()}</option>
            <option value="private">{i18n.schoolTypePrivate()}</option>
            <option value="public">{i18n.schoolTypePublic()}</option>
            <option value="homeschool">{i18n.schoolTypeHomeschool()}</option>
            <option value="afterschool">{i18n.schoolTypeAfter()}</option>
            <option value="organization">
              {i18n.schoolTypeOrganization()}
            </option>
            <option value="other">{i18n.schoolTypeOther()}</option>
          </select>
        </div>
        {showError && errorDiv}
      </div>
    );
  }
}

const styles = {
  asterisk: {
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red
  },
  errors: {
    fontSize: 14,
    fontFamily: '"Gotham 3r", sans-serif',
    color: color.red,
    paddingTop: 5,
    paddingBottom: 5
  },
  singleLineLayoutStyles: {
    display: 'table-cell',
    width: 210,
    verticalAlign: 'middle',
    minHeight: 42,
    fontSize: 13,
    fontFamily: '"Gotham 4r", sans-serif',
    color: '#333',
    padding: 0
  },
  singleLineContainerStyles: {
    display: 'table',
    width: '100%'
  },
  selectStyle: {
    width: 390,
    verticalAlign: 'top',
    marginBottom: '5px',
    marginTop: '5px'
  }
};
