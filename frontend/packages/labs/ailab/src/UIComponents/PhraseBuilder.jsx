/* React component to handle setting datatype for selected columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getSelectableLabels,
  getSelectableFeatures,
  setLabelColumn,
  addSelectedFeature,
  removeSelectedFeature
} from "../redux";
import { ColumnTypes, styles } from "../constants.js";
import { Bar } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

class PhraseBuilder extends Component {
  static propTypes = {
    labelColumn: PropTypes.string,
    currentColumnData: PropTypes.object,
    setLabelColumn: PropTypes.func.isRequired,
    addSelectedFeature: PropTypes.func.isRequired,
    removeSelectedFeature: PropTypes.func.isRequired,
    rangesByColumn: PropTypes.object,
    setCurrentColumn: PropTypes.func,
    hideSpecifyColumns: PropTypes.bool,
    selectableLabels: PropTypes.array,
    selectableFeatures: PropTypes.array,
    selectedFeatures: PropTypes.array
  };

  handleChangeLabelSelect = event => {
    this.props.setLabelColumn(event.target.value);
  };

  handleChangeFeatureSelect = event => {
    this.props.addSelectedFeature(event.target.value);
  };

  removeSelectedFeature = feature => {
    this.props.removeSelectedFeature(feature);
  };

  render() {
    const {
      currentColumnData,
      rangesByColumn,
      labelColumn,
      selectedFeatures,
      selectableLabels,
      selectableFeatures
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

    const maxLabelsInHistogram = 4;

    return (
      <div
        id="phrase-builder"
        style={{
          ...styles.panel,
          ...styles.rightPanel,
          ...styles.phraseBuilder
        }}
      >
        <div style={styles.phraseBuilderHeader}>Predict...</div>
        <select
          value={labelColumn}
          onChange={this.handleChangeLabelSelect}
          style={styles.phraseBuilderSelect}
        >
          <option>{""}</option>
          {selectableLabels.map((feature, index) => {
            return (
              <option key={index} value={feature}>
                {feature}
              </option>
            );
          })}
        </select>
        <br />
        <div style={styles.phraseBuilderHeader}>Based on...</div>
        {selectedFeatures.map((feature, index) => {
          return (
            <div key={index} style={styles.phraseBuilderFeature}>
              {feature}
              <div
                onClick={() => this.removeSelectedFeature(feature)}
                style={styles.phraseBuilderFeatureRemove}
              >
                <FontAwesomeIcon icon={faTimes} />
              </div>
            </div>
          );
        })}
        <select
          value={""}
          onChange={this.handleChangeFeatureSelect}
          style={styles.phraseBuilderSelect}
        >
          <option key="default" value="" disabled>
            + Add feature
          </option>
          {selectableFeatures.map((feature, index) => {
            return (
              <option key={index} value={feature}>
                {feature}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

export default connect(
  state => ({
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    selectableLabels: getSelectableLabels(state),
    selectableFeatures: getSelectableFeatures(state)
  }),
  dispatch => ({
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
)(PhraseBuilder);
