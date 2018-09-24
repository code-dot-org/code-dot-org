import React, { Component, PropTypes } from 'react';
import SchoolAutocompleteDropdown from '../SchoolAutocompleteDropdown';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import i18n from "@cdo/locale";
import { styles } from './censusFormStyles';

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
const checkboxStyle = {
  display: "flex",
};

export default class SchoolAutocompleteDropdownWithLabel extends Component {
  static propTypes = {
    setField: PropTypes.func,
    showErrorMsg: PropTypes.bool,
    // Value is the NCES id of the school
    value: PropTypes.string,
    fieldName: PropTypes.string,
    singleLineLayout: PropTypes.bool,
    showRequiredIndicator: PropTypes.bool,
    schoolDropdownOption: PropTypes.object,
    schoolFilter: PropTypes.func,
  };

  schoolDropdown = undefined;

  static defaultProps = {
    showRequiredIndicator: true,
  };

  sendToParent = (selectValue) => {
    // selectValue has a label, school, value.  school has nces_id which is same as value.
    this.props.setField("nces", selectValue);
  };

  handleSchoolNotFoundCheckbox(event) {
    var checkbox = event.target;
    if (checkbox.checked) {
      this.props.setField("nces", this.schoolDropdown.constructSchoolNotFoundOption());
    } else {
      this.props.setField("nces", this.props.schoolDropdownOption);
    }
  }

  bindDropdown = (dropdown) => {
    this.schoolDropdown=dropdown;
  };

  render() {
    const {showRequiredIndicator, singleLineLayout} = this.props;
    const questionStyle = {...styles.question, ...(singleLineLayout && singleLineLayoutStyles)};
    const containerStyle = {...(singleLineLayout && singleLineContainerStyles)};
    const showError = this.props.showErrorMsg && !this.props.value && !this.props.schoolDropdownOption;
    const schoolNotFound = !!((this.props.value === "-1") || (this.props.schoolDropdownOption && this.props.schoolDropdownOption.value === "-1"));
    const errorDiv = (
      <div style={styles.errors}>
        {i18n.censusRequiredSelect()}
      </div>
    );

    return (
      <div>
        <div style={containerStyle}>
          <div style={questionStyle}>
            {singleLineLayout ? i18n.school() : i18n.schoolName()}
            {showRequiredIndicator && (
               <span style={styles.asterisk}> *</span>
            )}
            {!singleLineLayout && showError && errorDiv}
          </div>
          <SchoolAutocompleteDropdown
            ref={this.bindDropdown}
            value={this.props.value}
            fieldName={this.props.fieldName}
            onChange={this.sendToParent}
            schoolDropdownOption={this.props.schoolDropdownOption}
            schoolFilter={this.props.schoolFilter}
          />
        <label style={checkboxStyle}>
            <input id="schoolNotFoundCheckbox" type="checkbox" onChange={this.handleSchoolNotFoundCheckbox.bind(this)} checked={schoolNotFound}/>
            <span style={styles.checkboxOption}>
              {i18n.schoolNotFoundCheckboxLabel()}
            </span>
          </label>
        </div>
        {singleLineLayout && showError && errorDiv}
      </div>
    );
  }
}
