import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import i18n from "@cdo/locale";
import { styles } from './census2017/censusFormStyles';
import { COUNTRIES } from '../geographyConstants';

export default class CountryAutocompleteDropdown extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    showErrorMsg: PropTypes.bool,
    required: PropTypes.bool,
    value: PropTypes.string
  };

  handleChange = (event) => {
    this.props.onChange("country", event);
  }

  render() {
    const {required, showErrorMsg, value} = this.props;

    return (
      <div>
        <div style={styles.question}>
          {i18n.schoolCountry()}
          {required && (
            <span style={styles.asterisk}> *</span>
          )}
          {showErrorMsg && (
            <div style={styles.errors}>
              {i18n.censusRequiredSelect()}
            </div>
          )}
        </div>
        <VirtualizedSelect
          id="country"
          name="country_s"
          options={COUNTRIES}
          value={value}
          onChange={this.handleChange}
          placeholder={i18n.searchForCountry()}
          labelKey="value"
          matchPos="start"
        />
      </div>
    );
  }
}
