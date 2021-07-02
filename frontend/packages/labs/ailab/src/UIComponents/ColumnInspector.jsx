/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setLabelColumn,
  setColumnsByDataType,
  getCurrentColumnData,
  addSelectedFeature,
  removeSelectedFeature
} from "../redux";
import {
  ColumnTypes,
  styles,
  colors,
  UNIQUE_OPTIONS_MAX
} from "../constants.js";
import { Bar } from "react-chartjs-2";
import ScatterPlot from "./ScatterPlot";
import CrossTab from "./CrossTab";
import ScrollableContent from "./ScrollableContent";

const barData = {
  labels: [],
  datasets: [
    {
      label: "",
      backgroundColor: colors.tealTransparent,
      borderColor: colors.teal,
      borderWidth: 1,
      hoverBackgroundColor: "#59cad3",
      hoverBorderColor: "white",
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
    setCurrentColumn: PropTypes.func,
    currentPanel: PropTypes.string
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

  render() {
    const { currentColumnData, currentPanel } = this.props;

    const isCategorical =
      currentColumnData &&
      currentColumnData.dataType === ColumnTypes.CATEGORICAL;

    const isNumerical =
      currentColumnData && currentColumnData.dataType === ColumnTypes.NUMERICAL;

    if (isCategorical) {
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
          className="column-inspector"
          style={{
            ...styles.panel,
            ...styles.rightPanel
          }}
        >
          <div style={styles.largeText}>{currentColumnData.id}</div>
          <ScrollableContent>
            <span style={styles.bold}>Data Type:</span>
            &nbsp;
            {currentColumnData.readOnly && currentColumnData.dataType}
            {!currentColumnData.readOnly && (
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
                <span style={styles.bold}>Description:</span>
                &nbsp;
                <div>{currentColumnData.description}</div>
                <br />
              </div>
            )}
            {currentPanel === "dataDisplayFeatures" && (
              <div>
                <ScatterPlot />
                <CrossTab />
              </div>
            )}
            {isCategorical && (
              <div>
                <div style={styles.bold}>Column information:</div>

                <div style={styles.barChart}>
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
              </div>
            )}
            {isNumerical && currentColumnData.extrema && (
              <div>
                <div style={styles.bold}>Column information:</div>
                {!currentColumnData.isColumnDataValid && (
                  <p style={styles.error}>
                    Numerical columns cannot contain strings.
                  </p>
                )}
                {currentColumnData.isColumnDataValid && (
                  <div style={styles.contents}>
                    min: {currentColumnData.extrema.min}
                    <br />
                    max: {currentColumnData.extrema.max}
                    <br />
                    range: {currentColumnData.extrema.range}
                  </div>
                )}
              </div>
            )}
          </ScrollableContent>

          {currentPanel === "dataDisplayLabel" &&
            currentColumnData.isSelectable && (
              <button
                type="button"
                id="select-label-button"
                onClick={e => this.setPredictColumn(e, currentColumnData.id)}
                style={styles.selectLabelButton}
              >
                Select label
              </button>
            )}

          {currentPanel === "dataDisplayFeatures" &&
            currentColumnData.isSelectable && (
              <button
                type="button"
                id="select-feature-button"
                onClick={e => this.addFeature(e, currentColumnData.id)}
                style={styles.selectFeaturesButton}
              >
                Add feature
              </button>
            )}

          {currentColumnData.hasTooManyUniqueOptions && (
            <div>
              <span style={styles.bold}>Note:</span>
              &nbsp; Categorical columns with more than {
                UNIQUE_OPTIONS_MAX
              }{" "}
              unique values can not be selected as the label or a feature.
            </div>
          )}
        </div>
      )
    );
  }
}

export default connect(
  state => ({
    currentColumnData: getCurrentColumnData(state),
    currentPanel: state.currentPanel
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
    }
  })
)(ColumnInspector);
