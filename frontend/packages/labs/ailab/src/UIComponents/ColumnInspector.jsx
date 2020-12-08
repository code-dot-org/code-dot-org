/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getSelectedColumns,
  setColumnsByDataType,
  getOptionFrequenciesByColumn,
  getRangesByColumn,
  getColumnTypeReadOnly,
} from "../redux";
import { ColumnTypes, styles } from "../constants.js";

class ColumnInspector extends Component {
  static propTypes = {
    selectedColumns: PropTypes.arrayOf(PropTypes.object),
    columnsByDataType: PropTypes.object,
    setColumnsByDataType: PropTypes.func.isRequired,
    uniqueOptionsByColumn: PropTypes.object,
    getRangesByColumn: PropTypes.func,
    rangesByColumn: PropTypes.object,
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  render() {
    const {
      selectedColumns,
      columnsByDataType,
      uniqueOptionsByColumn,
      rangesByColumn,
    } = this.props;

    return (
      <div id="column-inspector">
        {selectedColumns.length > 0 && (
          <div style={styles.panel}>
            <div style={styles.largeText}>
              Describe the data in each of your selected columns
            </div>
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
              {selectedColumns.map((column, index) => {
                return (
                  <div key={index}>
                    <label>
                      {column.readOnly && (
                        <div>
                          {column.id}: {columnsByDataType[column.id]}
                        </div>
                      )}

                      {!column.readOnly && (
                        <div>
                          {column.id}: &nbsp;
                          <select
                            onChange={event =>
                              this.handleChangeDataType(event, column.id)
                            }
                            value={columnsByDataType[column.id]}
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
                      )}
                    </label>

                    {columnsByDataType[column.id] ===
                      ColumnTypes.CATEGORICAL && (
                      <div>
                        <p>
                          {Object.keys(uniqueOptionsByColumn[column.id]).length}{" "}
                          unique values for {column.id}:{" "}
                        </p>
                        <div style={styles.subPanel}>
                          <table>
                            <thead>
                              <tr>
                                <th>Option</th>
                                <th>Frequency</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(uniqueOptionsByColumn[column.id])
                                .sort()
                                .map((option, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{option}</td>
                                      <td>
                                        {
                                          uniqueOptionsByColumn[column.id][
                                            option
                                          ]
                                        }
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {columnsByDataType[column] === ColumnTypes.CONTINUOUS && (
                      <div>
                        {rangesByColumn[column.id] && (
                          <div>
                            {isNaN(rangesByColumn[column.id].min) && (
                              <p style={styles.error}>
                                Continuous columns should contain only numbers.
                              </p>
                            )}
                            {!isNaN(rangesByColumn[column.id].min) && (
                              <div style={styles.subPanel}>
                                min: {rangesByColumn[column.id].min}
                                <br />
                                max: {rangesByColumn[column.id].max}
                              </div>
                            )}
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
    uniqueOptionsByColumn: getOptionFrequenciesByColumn(state),
    rangesByColumn: getRangesByColumn(state),
  }),
  dispatch => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    },
  })
)(ColumnInspector);
