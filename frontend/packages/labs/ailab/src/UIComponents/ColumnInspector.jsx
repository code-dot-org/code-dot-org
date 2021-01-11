/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setColumnsByDataType,
  getCurrentColumnData
} from "../redux";
import { ColumnTypes, styles } from "../constants.js";

class ColumnInspector extends Component {
  static propTypes = {
    setColumnsByDataType: PropTypes.func.isRequired,
    currentColumnData: PropTypes.object
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  render() {
    const {
      currentColumnData
    } = this.props;

    return (
      <div id="column-inspector">
        {currentColumnData && (
          <div style={styles.validationMessagesLight}>
            {/*
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
            */}
            <form>
              <div>
                <label>
                  {currentColumnData.readOnly && (
                    <div>
                      {currentColumnData.id}: {currentColumnData.dataType}
                    </div>
                  )}

                  {!currentColumnData.readOnly && (
                    <div>
                      {currentColumnData.id}: &nbsp;
                      <select
                        onChange={event =>
                          this.handleChangeDataType(event, currentColumnData.id)
                        }
                        value={currentColumnData.dataType}
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

                {currentColumnData.dataType ===
                  ColumnTypes.CATEGORICAL && (
                  <div>
                    <p>
                      {Object.keys(currentColumnData.uniqueOptions).length}{" "}
                      unique values for {currentColumnData.id}:{" "}
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
                          {Object.keys(currentColumnData.uniqueOptions)
                            .sort()
                            .map((option, index) => {
                              return (
                                <tr key={index}>
                                  <td>{option}</td>
                                  <td>
                                    {
                                      currentColumnData.frequencies[
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
                {/* currentColumnData.kind === ColumnTypes.CONTINUOUS && (
                  <div>
                    {currentColumnData.range && (
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
                )*/}
                <br />
                <br />
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    currentColumnData: getCurrentColumnData(state)
  }),
  dispatch => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    }
  })
)(ColumnInspector);
