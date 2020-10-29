/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getSelectedColumns, setColumnsByDataType } from "../redux";
import { ColumnTypes } from "../constants.js";

class ColumnInspector extends Component {
  static propTypes = {
    getSelectedColumns: PropTypes.func,
    selectedColumns: PropTypes.array,
    columnsByDataType: PropTypes.object,
    setColumnsByDataType: PropTypes.func.isRequired
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
    columnsByDataType: state.columnsByDataType
  }),
  dispatch => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    },
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    }
  })
)(ColumnInspector);
