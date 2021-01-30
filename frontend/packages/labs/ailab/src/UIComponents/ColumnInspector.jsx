/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setLabelColumn,
  setColumnsByDataType,
  getCurrentColumnData,
  addSelectedFeature,
  removeSelectedFeature,
  getCurrentColumnIsSelectedFeature,
  getCurrentColumnIsSelectedLabel,
  getRangesByColumn,
  setCurrentColumn
} from "../redux";
import { ColumnTypes, styles } from "../constants.js";
import Histogram from "react-chart-histogram";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

class ColumnInspector extends Component {
  static propTypes = {
    setColumnsByDataType: PropTypes.func.isRequired,
    currentColumnData: PropTypes.object,
    setLabelColumn: PropTypes.func.isRequired,
    addSelectedFeature: PropTypes.func.isRequired,
    removeSelectedFeature: PropTypes.func.isRequired,
    currentColumnIsSelectedFeature: PropTypes.bool,
    currentColumnIsSelectedLabel: PropTypes.bool,
    rangesByColumn: PropTypes.object,
    setCurrentColumn: PropTypes.func
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  setPredictColumn = () => {
    this.props.setLabelColumn(this.props.currentColumnData.id);
  };

  addFeature = () => {
    this.props.addSelectedFeature(this.props.currentColumnData.id);
  };

  removeLabel = () => {
    this.props.setLabelColumn(null);
  }

  removeFeature = () => {
    this.props.removeSelectedFeature(this.props.currentColumnData.id);
  };

  onClose = () => {
    this.props.setCurrentColumn(undefined);
  }

  render() {
    const {
      currentColumnData,
      currentColumnIsSelectedFeature,
      currentColumnIsSelectedLabel,
      rangesByColumn
    } = this.props;

    let labels, data, options;
    if (
      currentColumnData &&
      currentColumnData.dataType === ColumnTypes.CATEGORICAL
    ) {
      labels = Object.values(currentColumnData.uniqueOptions);
      data = labels.map(option => {
        return currentColumnData.frequencies[option];
      });
      options = { fillColor: "#000", strokeColor: "#000" };
    }

    return (
      <div id="column-inspector">
        {currentColumnData && (
          <div style={styles.validationMessagesLight}>
            <div onClick={this.onClose} style={styles.popupClose}>
              <FontAwesomeIcon icon={faTimes} />
            </div>

            {currentColumnData.dataType === ColumnTypes.OTHER && (
              <div>
                <div style={styles.mediumText}>
                  Describe the data in each of your selected columns
                </div>
                <div style={styles.smallText}>
                  Categorical columns contain a fixed number of possible values that
                  indicate a group. For example, the column "Size" might contain
                  categorical data such as "small", "medium" and "large".{" "}
                </div>
                <div style={styles.smallText}>
                  Continuous columns contain a range of possible numerical values
                  that could fall anywhere on a continuum. For example, the column
                  "Height in inches" might contain continuous data such as "12",
                  "11.25" and "9.07".{" "}
                </div>
                <div style={styles.smallText}>
                  If the column contains anything other than categorical or
                  continuous data, it's not going to work for training this type of
                  machine learning model.
                </div>
              </div>
            )}

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

                {currentColumnData.dataType === ColumnTypes.CATEGORICAL && (
                  <div>
                    <br />
                    <Histogram
                      xLabels={labels}
                      yValues={data}
                      width="300"
                      height="150"
                      options={options}
                    />
                  </div>
                )}

                {currentColumnData.dataType === ColumnTypes.CONTINUOUS && (
                  <div>
                    {currentColumnData.range && (
                      <div>
                        {isNaN(rangesByColumn[currentColumnData.id].min) && (
                          <p style={styles.error}>
                            Continuous columns should contain only numbers.
                          </p>
                        )}
                        {!isNaN(rangesByColumn[currentColumnData.id].min) && (
                          <div style={styles.subPanel}>
                            min: {rangesByColumn[currentColumnData.id].min}
                            <br />
                            max: {rangesByColumn[currentColumnData.id].max}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <br />
                <br />
              </div>
            </form>

            {currentColumnData.dataType !== ColumnTypes.OTHER && (
              <div>
                {!currentColumnIsSelectedLabel && !currentColumnIsSelectedFeature && (
                  <div>
                    <button
                      type="button"
                      onClick={this.setPredictColumn}
                      style={styles.predictButton}
                    >
                      Predict this column
                    </button>
                    <br />
                    <button
                      type="button"
                      onClick={this.addFeature}
                      style={styles.predictBasedButton}
                    >
                      Predict based on this column
                    </button>
                    <br />
                  </div>
                )}

                {currentColumnIsSelectedLabel && (
                  <button
                    type="button"
                    onClick={this.removeLabel}
                    style={styles.dontPredictButton}
                  >
                    Don't predict this column
                  </button>
                )}

                {currentColumnIsSelectedFeature && (
                  <button
                    type="button"
                    onClick={this.removeFeature}
                    style={styles.dontPredictBasedButton}
                  >
                    Don't predict based on this column
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    currentColumnData: getCurrentColumnData(state),
    currentColumnIsSelectedFeature: getCurrentColumnIsSelectedFeature(state),
    currentColumnIsSelectedLabel: getCurrentColumnIsSelectedLabel(state),
    rangesByColumn: getRangesByColumn(state)
  }),
  dispatch => ({
    setColumnsByDataType(column, dataType) {
      dispatch(setColumnsByDataType(column, dataType));
    },
    setLabelColumn(labelColumn) {
      dispatch(setLabelColumn(labelColumn));
    },
    addSelectedFeature(labelColumn) {
      dispatch(addSelectedFeature(labelColumn));
    },
    removeSelectedFeature(labelColumn) {
      dispatch(removeSelectedFeature(labelColumn));
    },
    setCurrentColumn(column) {
      dispatch(setCurrentColumn(column));
    }
  })
)(ColumnInspector);
