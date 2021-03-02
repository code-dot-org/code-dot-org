/* React component to handle setting data types for columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setColumnsByDataType } from "../redux";
import { ColumnTypes, styles } from "../constants";

class ColumnTypeSelector extends Component {
  static propTypes = {
    setColumnsByDataType: PropTypes.func.isRequired,
    columnsByDataType: PropTypes.object,
    labelColumn: PropTypes.string,
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  render() {
    const { data, columnsByDataType } = this.props;
    const columns = this.props.selectedFeatures.concat(this.props.labelColumn);

    return (
      <div>
        <div>Double check the data type for each column.</div>
        <div style={styles.scrollingContents}>
          {columns.map((key) => {
            return (
              <div key={key} style={styles.cardRow}>
                <div
                  style={{
                    ...styles.bold,
                    ...styles.specifyColumnsItem,
                  }}
                >
                  {key}
                </div>

                <select
                  onChange={(event) => this.handleChangeDataType(event, key)}
                  value={columnsByDataType[key]}
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
          })}
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    columnsByDataType: state.columnsByDataType,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
  }),
  (dispatch) => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    },
  })
)(ColumnTypeSelector);
