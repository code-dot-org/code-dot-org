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

export default class SchoolAutocompleteDropdownWithLabel extends Component {
  static propTypes = {
    setField: PropTypes.func,
    showErrorMsg: PropTypes.bool,
    // Value is the NCES id of the school
    value: PropTypes.string,
    singleLineLayout: PropTypes.bool,
  };

  sendToParent = (selectValue) => {
    this.props.setField("nces", selectValue);
  };

  render() {
    const singleLineLayout = this.props.singleLineLayout;
    const questionStyle = {...styles.question, ...(singleLineLayout && singleLineLayoutStyles)};
    const containerStyle = {...(singleLineLayout && singleLineContainerStyles)};

    return (
      <div style={containerStyle}>
        <div style={questionStyle}>
          {i18n.schoolName()}
          <span style={styles.asterisk}> *</span>
          {this.props.showErrorMsg && (
            <div style={styles.errors}>
              {i18n.censusRequiredSelect()}
            </div>
          )}
        </div>
        <SchoolAutocompleteDropdown
          value={this.props.value}
          onChange={this.sendToParent}
        />
      </div>
    );
  }
}
