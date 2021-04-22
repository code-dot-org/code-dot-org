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
  getRangesByColumn,
  setCurrentColumn
} from "../redux";
import { ColumnTypes, styles } from "../constants.js";
import { Bar } from "react-chartjs-2";
import ScatterPlot from "./ScatterPlot";
import CrossTab from "./CrossTab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const barData = {
  labels: [],
  datasets: [
    {
      label: "",
      backgroundColor: "rgba(255,99,132,0.2)",
      borderColor: "rgba(255,99,132,1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(255,99,132,0.4)",
      hoverBorderColor: "rgba(255,99,132,1)",
      data: []
    }
  ]
};

const chartOptions = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true
        }
      }
    ]
  },
  legend: { display: false },
  maintainAspectRatio: false
};

class ColumnInspector extends Component {
  static propTypes = {
    setColumnsByDataType: PropTypes.func.isRequired,
    currentColumnData: PropTypes.object,
    setLabelColumn: PropTypes.func.isRequired,
    addSelectedFeature: PropTypes.func.isRequired,
    removeSelectedFeature: PropTypes.func.isRequired,
    rangesByColumn: PropTypes.object,
    setCurrentColumn: PropTypes.func,
    hideSpecifyColumns: PropTypes.bool,
    currentPanel: PropTypes.string,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array
  };

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setColumnsByDataType(feature, event.target.value);
  };

  setPredictColumn = e => {
    this.props.setLabelColumn(this.props.currentColumnData.id);
    e.preventDefault();
  };

  addFeature = e => {
    this.props.addSelectedFeature(this.props.currentColumnData.id);
    e.preventDefault();
  };

  removeLabel = () => {
    this.props.setLabelColumn(null);
  };

  removeFeature = () => {
    this.props.removeSelectedFeature(this.props.currentColumnData.id);
  };

  onClose = () => {
    this.props.setCurrentColumn(undefined);
  };

  render() {
    const {
      currentColumnData,
      rangesByColumn,
      currentPanel,
      labelColumn,
      selectedFeatures
    } = this.props;

    if (
      currentColumnData &&
      currentColumnData.dataType === ColumnTypes.CATEGORICAL
    ) {
      barData.labels = Object.values(currentColumnData.uniqueOptions);
      barData.datasets[0].data = barData.labels.map(option => {
        return currentColumnData.frequencies[option];
      });
      barData.datasets[0].label = currentColumnData.id;
    }

    const maxLabelsInHistogram = 5;

    return (
      currentColumnData && (
        <div
          id="column-inspector"
          style={{
            ...styles.panel,
            ...styles.rightPanel
          }}
        >
          <div style={styles.scrollableContents}>
            <div style={styles.scrollingContents}>
              <div onClick={this.onClose} style={styles.popupClose}>
                <FontAwesomeIcon icon={faTimes} />
              </div>
              <div style={styles.largeText}>{currentColumnData.id}</div>
              <form>
                <div>
                  <label>
                    <div>Data Type:</div>
                    {this.props.hideSpecifyColumns && (
                      <div> {currentColumnData.dataType} </div>
                    )}
                    {!this.props.hideSpecifyColumns && (
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
                    )}
                    {currentColumnData.description && (
                      <div>
                        <br />
                        <div>{currentColumnData.description}</div>
                        <br />
                      </div>
                    )}
                  </label>

                  {currentPanel === "dataDisplayLabel" &&
                    currentColumnData.dataType === ColumnTypes.CATEGORICAL && (
                      <div>
                        {barData.labels.length <= maxLabelsInHistogram && (
                          <Bar
                            data={barData}
                            width={100}
                            height={150}
                            options={chartOptions}
                          />
                        )}
                        {barData.labels.length > maxLabelsInHistogram && (
                          <div>
                            {barData.labels.length} values were found in this
                            column. A graph is only shown when there are{" "}
                            {maxLabelsInHistogram} or fewer.
                          </div>
                        )}
                      </div>
                    )}

                  {currentPanel === "dataDisplayFeatures" && (
                    <div>
                      <ScatterPlot />
                      <CrossTab />
                    </div>
                  )}

                  {currentColumnData.dataType === ColumnTypes.NUMERICAL && (
                    <div>
                      {currentColumnData.range && (
                        <div>
                          {isNaN(rangesByColumn[currentColumnData.id].min) && (
                            <p style={styles.error}>
                              Numerical columns should contain only numbers.
                            </p>
                          )}
                          {!isNaN(rangesByColumn[currentColumnData.id].min) && (
                            <div style={styles.contents}>
                              min: {rangesByColumn[currentColumnData.id].min}
                              <br />
                              max: {rangesByColumn[currentColumnData.id].max}
                              <br />
                              range:{" "}
                              {rangesByColumn[currentColumnData.id].range}
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

              {currentPanel === "dataDisplayLabel" &&
                currentColumnData.id !== labelColumn && (
                  <button
                    type="button"
                    onClick={e =>
                      this.setPredictColumn(e, currentColumnData.id)
                    }
                    style={styles.selectLabelButton}
                  >
                    Select label
                  </button>
                )}

              {currentPanel === "dataDisplayFeatures" &&
                !selectedFeatures.includes(currentColumnData.id) && (
                  <button
                    type="button"
                    onClick={e => this.addFeature(e, currentColumnData.id)}
                    style={styles.selectFeaturesButton}
                  >
                    Add feature
                  </button>
                )}
            </div>
          </div>
        </div>
      )
    );
  }
}

export default connect(
  state => ({
    currentColumnData: getCurrentColumnData(state),
    rangesByColumn: getRangesByColumn(state),
    hideSpecifyColumns: state.mode && state.mode.hideSpecifyColumns,
    currentPanel: state.currentPanel,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures
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
