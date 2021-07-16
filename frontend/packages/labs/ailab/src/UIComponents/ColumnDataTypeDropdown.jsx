/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setColumnsByDataType } from "../redux";
import { ColumnTypes } from "../constants.js";

class ColumnDataTypeDropdown extends Component {
  static propTypes = {
    columnId: PropTypes.string,
    currentDataType: PropTypes.oneOf(Object.values(ColumnTypes)),
    setColumnsByDataType: PropTypes.func.isRequired
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  render() {
    const { columnId, currentDataType } = this.props;

    return (
      <div>
        <select
          onChange={event =>
            this.handleChangeDataType(event, columnId)
          }
          value={currentDataType}
        >
          {Object.values(ColumnTypes).map((option, index) => {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    }
  })
)(ColumnDataTypeDropdown);
