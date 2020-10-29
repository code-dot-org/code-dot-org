/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getSelectedColumns,
  setColumnsByDataType,
  getUniqueOptionsByColumn,
  getRangesByColumn
} from "../redux";
import { ColumnTypes, styles } from "../constants.js";

class ColumnInspector extends Component {
  static propTypes = {
    getSelectedColumns: PropTypes.func,
    selectedColumns: PropTypes.array,
    columnsByDataType: PropTypes.object,
    setColumnsByDataType: PropTypes.func.isRequired,
    getUniqueOptionsByColumn: PropTypes.func,
    uniqueOptionsByColumn: PropTypes.object,
    getRangesByColumn: PropTypes.func,
    rangesByColumn: PropTypes.object
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  render() {
    return (
      <div>
        {this.props.selectedColumns.length > 0 && (
          <div>
            <h2>Describe the data in each of your selected columns</h2>
            <p>
              Categorical columns contain a fixed number of possible values that
              indicate a group. For example, the column "Size" might contain
              categorical data such as "small", "medium" and "large".{" "}
            </p>
            <p>
              Continuous columns contain a range of possible numerical values
              that could fall anywhere on a continuum. For example, the column
              "Height in inches" might contain continuous data such as "12",
              "11.25" and "9.07".{" "}
            </p>
            <p>
              If the column contains anything other than categorical or
              continuous data, it's not going to work for training this type of
              machine learning model.
            </p>
            <form>
              {this.props.selectedColumns.map((column, index) => {
                return (
                  <div key={index}>
                    {this.props.columnsByDataType[column] && (
                      <label>
                        {column}:
                        <select
                          onChange={event =>
                            this.handleChangeDataType(event, column)
                          }
                          value={this.props.columnsByDataType[column]}
                        >
                          {Object.values(ColumnTypes).map((option, index) => {
                            return (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                    )}
                    {this.props.columnsByDataType[column] ===
                      ColumnTypes.CATEGORICAL && (
                      <div>
                        <p>
                          {this.props.uniqueOptionsByColumn[column].length}{" "}
                          unique values for {column}:{" "}
                        </p>
                        {this.props.uniqueOptionsByColumn[column].map(
                          (option, index) => {
                            return <div key={index}>{option}</div>;
                          }
                        )}
                      </div>
                    )}
                    {this.props.columnsByDataType[column] ===
                      ColumnTypes.CONTINUOUS && (
                      <div>
                        {this.props.rangesByColumn[column] && (
                          <div>
                            {isNaN(this.props.rangesByColumn[column].min) && (
                              <p style={styles.error}>
                                Continuous columns should contain only numbers.
                              </p>
                            )}
                            <br />
                            min: {this.props.rangesByColumn[column].min}
                            <br />
                            <br />
                            max: {this.props.rangesByColumn[column].max}
                          </div>
                        )}
                      </div>
                    )}
                    <br />
                    <br />
                  </div>
                );
              })}
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedColumns: getSelectedColumns(state),
    columnsByDataType: state.columnsByDataType,
    uniqueOptionsByColumn: getUniqueOptionsByColumn(state),
    rangesByColumn: getRangesByColumn(state)
  }),
  dispatch => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    }
  })
)(ColumnInspector);
