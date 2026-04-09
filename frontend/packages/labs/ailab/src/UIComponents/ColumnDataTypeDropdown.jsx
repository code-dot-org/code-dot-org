/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { setColumnsByDataType } from "../redux";
import { ColumnTypes } from "../constants.js";
import I18n from "../i18n";

function ColumnDataTypeDropdown({ columnId, currentDataType, setColumnsByDataType }) {
  const handleChangeDataType = (event, feature) => {
    event.preventDefault();
    setColumnsByDataType(feature, event.target.value);
  };

  return (
    <div>
      <select
        onChange={event =>
          handleChangeDataType(event, columnId)
        }
        value={currentDataType}
      >
        {Object.values(ColumnTypes).map((option, index) => {
          return (
            <option key={index} value={option}>
              {I18n.t(`columnType_${option}`)}
            </option>
          );
        })}
      </select>
    </div>
  );
}

ColumnDataTypeDropdown.propTypes = {
  columnId: PropTypes.string,
  currentDataType: PropTypes.oneOf(Object.values(ColumnTypes)),
  setColumnsByDataType: PropTypes.func.isRequired
};

export default connect(
  state => ({}),
  dispatch => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    }
  })
)(ColumnDataTypeDropdown);
