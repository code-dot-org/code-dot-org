import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import i18n from "@cdo/locale";
import { styles } from './census2017/censusFormStyles';
import { COUNTRIES } from '../geographyConstants';

const singleLineLayoutStyles = {
  display: "table-cell",
  width: 210,
  verticalAlign: "middle",
  minHeight: 42,
  fontSize: 13,
  fontFamily: '"Gotham 4r", sans-serif',
  color: "#333",
  padding: 0,
};
const singleLineContainerStyles = {
  display: "table",
  width: "100%",
};

export default class CountryAutocompleteDropdown extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    showErrorMsg: PropTypes.bool,
    showRequiredIndicator: PropTypes.bool,
    value: PropTypes.string,
    fieldName: PropTypes.string,
    singleLineLayout: PropTypes.bool,
  };

  static defaultProps = {
    fieldName: "country_s"
  };

  handleChange = (event) => {
    this.props.onChange("country", event);
  }

  render() {
    const {showRequiredIndicator, showErrorMsg, value, singleLineLayout} = this.props;

    const questionStyle = {...styles.question, ...(singleLineLayout && singleLineLayoutStyles)};
    const containerStyle = {...(singleLineLayout && singleLineContainerStyles)};
    const showError = showErrorMsg && !value;
    const errorDiv = (
      <div style={styles.errors}>
        {i18n.censusRequiredSelect()}
      </div>
    );

    return (
      <div>
        <div style={containerStyle}>
          <div style={questionStyle}>
            {singleLineLayout ? i18n.country() : i18n.schoolCountry()}
            {showRequiredIndicator && (
               <span style={styles.asterisk}> *</span>
            )}
            {showError && !singleLineLayout && errorDiv}
          </div>
          <VirtualizedSelect
            id="country"
            name={this.props.fieldName}
            options={COUNTRIES}
            value={value}
            onChange={this.handleChange}
            placeholder={i18n.searchForCountry()}
            labelKey="value"
            matchPos="start"
          />
        </div>
        {showError && singleLineLayout && errorDiv}
      </div>
    );
  }
}
