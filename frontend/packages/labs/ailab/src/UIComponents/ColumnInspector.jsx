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
import { Scatter, Bar } from "react-chartjs-2";

const scatterData = {
  labels: ["Scatter"],
  datasets: [
    {
      label: "",
      fill: true,
      backgroundColor: "rgba(75,192,192,0.4)",
      pointBorderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 2,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: []
    }
  ]
};

const barData = {
  labels: [],
  datasets: [
    {
      label: "",
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: []
    }
  ]
};

class ColumnInspector extends Component {
  static propTypes = {
    setColumnsByDataType: PropTypes.func.isRequired,
    currentColumnData: PropTypes.object,
    setLabelColumn: PropTypes.func.isRequired,
    addSelectedFeature: PropTypes.func.isRequired,
    removeSelectedFeature: PropTypes.func.isRequired,
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
  };

  removeFeature = () => {
    this.props.removeSelectedFeature(this.props.currentColumnData.id);
  };

  onClose = () => {
    this.props.setCurrentColumn(undefined);
  };

  render() {
    const { currentColumnData, rangesByColumn } = this.props;

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

      barData.labels = Object.values(currentColumnData.uniqueOptions);
      barData.datasets[0].data = labels.map(option => {
        return currentColumnData.frequencies[option];
      });
      barData.datasets[0].label = currentColumnData.id;

    } else if (
      currentColumnData &&
      currentColumnData.dataType === ColumnTypes.CONTINUOUS
    ) {
      const frequencies = currentColumnData.frequencies;
      scatterData.datasets[0].data = Object.keys(frequencies).map(
        (value, index) => {
          return { x: index, y: frequencies[value] };
        }
      );
      scatterData.datasets[0].label = currentColumnData.id;
    }

    return (
      currentColumnData && (
        <div
          id="column-inspector"
          style={{ ...styles.panel, ...styles.rightPanel }}
        >
          <div style={styles.largeText}>Column Information</div>
          <form>
            <div>
              <label>
                {true && (
                  <div>
                    {currentColumnData.id}: {currentColumnData.dataType}
                  </div>
                )}

                {currentColumnData.description && (
                  <div>
                    <br />
                    <div>{currentColumnData.description}</div>
                  </div>
                )}
              </label>

              {currentColumnData.dataType === ColumnTypes.CATEGORICAL &&
                labels.length < 5 && (
                  <div>
                    <br />
                    <Bar
                      data={barData}
                      width={100}
                      height={150}
                      options={{
                        maintainAspectRatio: false
                      }}
                    />
                  </div>
                )}

              {currentColumnData.dataType === ColumnTypes.CONTINUOUS && (
                <div>
                  <Scatter data={scatterData} />

                  {currentColumnData.range && (
                    <div>
                      {isNaN(rangesByColumn[currentColumnData.id].min) && (
                        <p style={styles.error}>
                          Continuous columns should contain only numbers.
                        </p>
                      )}
                      {!isNaN(rangesByColumn[currentColumnData.id].min) && (
                        <div style={styles.contents}>
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
        </div>
      )
    );
  }
}

export default connect(
  state => ({
    currentColumnData: getCurrentColumnData(state),
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
