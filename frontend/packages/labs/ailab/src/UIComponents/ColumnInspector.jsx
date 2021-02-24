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
import Histogram from "react-chart-histogram";

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
    }

    const maxLabelsInHistogram = 4;

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
                <div>
                  {currentColumnData.id}: {currentColumnData.dataType}
                </div>

                {currentColumnData.description && (
                  <div>
                    <br />
                    <div>{currentColumnData.description}</div>
                  </div>
                )}
              </label>

              {currentColumnData.dataType === ColumnTypes.CATEGORICAL &&
                labels.length <= maxLabelsInHistogram && (
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
