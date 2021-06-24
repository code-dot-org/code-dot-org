/*
  React component to handle displaying details, including data visualizations,
  for selected columns.
*/
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setLabelColumn,
  getCurrentColumnData,
  addSelectedFeature
} from "../redux";
import { styles, UNIQUE_OPTIONS_MAX } from "../constants.js";
import ScatterPlot from "./ScatterPlot";
import CrossTab from "./CrossTab";
import ScrollableContent from "./ScrollableContent";
import ColumnDetailsNumerical from "./ColumnDetailsNumerical";
import ColumnDetailsCategorical from "./ColumnDetailsCategorical";
import ColumnDataTypeDropdown from "./ColumnDataTypeDropdown";

class ColumnInspector extends Component {
  static propTypes = {
    currentColumnData: PropTypes.object,
    setLabelColumn: PropTypes.func.isRequired,
    addSelectedFeature: PropTypes.func.isRequired,
    currentPanel: PropTypes.string
  };

  setPredictColumn = e => {
    this.props.setLabelColumn(this.props.currentColumnData.id);
    e.preventDefault();
  };

  addFeature = e => {
    this.props.addSelectedFeature(this.props.currentColumnData.id);
    e.preventDefault();
  };

  render() {
    const { currentColumnData, currentPanel } = this.props;

    return (
      currentColumnData && (
        <div
          id="column-inspector"
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
              <ColumnDataTypeDropdown
                columnId={currentColumnData.id}
                currentDataType={currentColumnData.dataType}
              />
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
            {currentColumnData.uniqueOptions && (
              <ColumnDetailsCategorical
                id={currentColumnData.id}
                uniqueOptions={currentColumnData.uniqueOptions}
                optionFrequencies={currentColumnData.frequencies}
              />
            )}
            {currentColumnData.extrema && (
              <ColumnDetailsNumerical
                isColumnDataValid={currentColumnData.isColumnDataValid}
                extrema={currentColumnData.extrema}
              />
            )}
          </ScrollableContent>

          {currentPanel === "dataDisplayLabel" &&
            currentColumnData.isSelectable && (
              <button
                type="button"
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
    setLabelColumn(labelColumn) {
      dispatch(setLabelColumn(labelColumn));
    },
    addSelectedFeature(labelColumn) {
      dispatch(addSelectedFeature(labelColumn));
    }
  })
)(ColumnInspector);
