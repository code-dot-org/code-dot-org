import React, { Component, PropTypes } from 'react';
import i18n from "@cdo/locale";


const styles = {
  singleLineLayoutStyles: {
    display: "table-cell",
    width: 210,
    verticalAlign: "middle",
    minHeight: 42,
    fontSize: 13,
    fontFamily: '"Gotham 4r", sans-serif',
    color: "#333",
    padding: 0,
  },
  singleLineContainerStyles: {
    display: "table",
    width: "100%",
  },
  selectStyle: {
    width: 390,
    verticalAlign: 'top',
    marginBottom: '5px',
    marginTop: '5px',
  },
};

export default class SchoolTypeDropdown extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    fieldName: PropTypes.string
  };

  static defaultProps = {
    value: "",
    fieldName: "user[school_info_attributes][school_type]"
  };

  render() {
    return (
      <div style={styles.singleLineContainerStyles}>
        <div style={styles.singleLineLayoutStyles} >{i18n.signupFormSchoolType()}</div>
        <select
          id="school-type"
          name={this.props.fieldName}
          type="select"
          onChange={this.props.onChange}
          value={this.props.value}
          style={styles.selectStyle}
        >
          <option
            disabled={true}
            value=""
          >
          </option>
          <option
            value="charter"
          >
            {i18n.schoolTypeCharter()}
          </option>
          <option
            value="private"
          >
            {i18n.schoolTypePrivate()}
          </option>
          <option
            value="public"
          >
            {i18n.schoolTypePublic()}
          </option>
          <option
            value="homeschool"
          >
            {i18n.schoolTypeHomeschool()}
          </option>
          <option
            value="afterschool"
          >
            {i18n.schoolTypeAfter()}
          </option>
          <option
            value="organization"
          >
            {i18n.schoolTypeOrganization()}
          </option>
          <option
            value="other"
          >
            {i18n.schoolTypeOther()}
          </option>
        </select>
      </div>
    );
  }
}

