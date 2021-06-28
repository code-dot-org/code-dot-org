/*
  React component to handle displaying details, including data visualizations,
  for selected columns.
*/
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getCurrentColumnDetails } from "../selectors/currentColumnSelectors";
import { styles, UNIQUE_OPTIONS_MAX, ColumnTypes } from "../constants.js";
import ScatterPlot from "./ScatterPlot";
import CrossTab from "./CrossTab";
import ScrollableContent from "./ScrollableContent";
import ColumnDetailsNumerical from "./ColumnDetailsNumerical";
import ColumnDetailsCategorical from "./ColumnDetailsCategorical";
import ColumnDataTypeDropdown from "./ColumnDataTypeDropdown";
import AddFeatureButton from "./AddFeatureButton";
import SelectLabelButton from "./SelectLabelButton";

class ColumnInspector extends Component {
  static propTypes = {
    currentColumnDetails: PropTypes.object,
    currentPanel: PropTypes.string
  };

  render() {
    const { currentColumnDetails, currentPanel } = this.props;

    const selectingFeatures = currentPanel === "dataDisplayFeatures";
    const selectingLabel = currentPanel === "dataDisplayLabel";

    const isCategorical = currentColumnDetails && currentColumnDetails.dataType
      === ColumnTypes.CATEGORICAL;
    const isNumerical = currentColumnDetails && currentColumnDetails.dataType
      === ColumnTypes.NUMERICAL;

    if (!currentColumnDetails) {
      return null;
    }

    return (
      currentColumnDetails && (
        <div
          id="column-inspector"
          style={{
            ...styles.panel,
            ...styles.rightPanel
          }}
        >
          <div style={styles.largeText}>{currentColumnDetails.id}</div>
          <ScrollableContent>
            <span style={styles.bold}>Data Type:</span>
            &nbsp;
            {currentColumnDetails.readOnly && currentColumnDetails.dataType}
            {!currentColumnDetails.readOnly && (
              <ColumnDataTypeDropdown
                columnId={currentColumnDetails.id}
                currentDataType={currentColumnDetails.dataType}
              />
            )}
            {currentColumnDetails.description && (
              <div>
                <br />
                <span style={styles.bold}>Description:</span>
                &nbsp;
                <div>{currentColumnDetails.description}</div>
                <br />
              </div>
            )}
            {selectingFeatures && (
              <div>
                <ScatterPlot />
                <CrossTab />
              </div>
            )}
            {isCategorical && <ColumnDetailsCategorical /> }
            {isNumerical && <ColumnDetailsNumerical /> }
          </ScrollableContent>

          {selectingLabel && currentColumnDetails.isSelectable && (
            <SelectLabelButton column={currentColumnDetails.id} />
          )}

          {selectingFeatures && currentColumnDetails.isSelectable && (
            <AddFeatureButton column={currentColumnDetails.id} />
          )}

          {currentColumnDetails.hasTooManyUniqueOptions && (
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
    currentColumnDetails: getCurrentColumnDetails(state),
    currentPanel: state.currentPanel
  })
)(ColumnInspector);
