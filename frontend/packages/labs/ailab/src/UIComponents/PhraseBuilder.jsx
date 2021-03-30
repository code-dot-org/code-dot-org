/* React component for choosing label and features for prediction. */
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
import { styles } from "../constants.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

class PhraseBuilder extends Component {
  static propTypes = {
    labelColumn: PropTypes.string,
    setLabelColumn: PropTypes.func.isRequired,
    addSelectedFeature: PropTypes.func.isRequired,
    removeSelectedFeature: PropTypes.func.isRequired,
    setCurrentColumn: PropTypes.func,
    hideSpecifyColumns: PropTypes.bool,
    selectableLabels: PropTypes.array,
    selectableFeatures: PropTypes.array,
    selectedFeatures: PropTypes.array,
    currentPanel: PropTypes.string
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
      labelColumn,
      selectedFeatures,
      selectableLabels,
      selectableFeatures,
      currentPanel
    } = this.props;

    return (
      <div
        id="phrase-builder"
        style={{
          ...styles.panel,
          ...styles.rightPanel,
          ...styles.phraseBuilder
        }}
      >
        <div style={styles.scrollableContents}>
          <div style={styles.scrollingContents}>
            <div style={styles.phraseBuilderHeader}>Predict...</div>
            {currentPanel === "dataDisplayLabel" && (
              <select
                value={labelColumn === null ? "" : labelColumn}
                onChange={this.handleChangeLabelSelect}
                style={styles.phraseBuilderSelect}
              >
                <option key="default" value="" disabled>
                  Choose Label
                </option>
                {selectableLabels.map((feature, index) => {
                  return (
                    <option key={index} value={feature}>
                      {feature}
                    </option>
                  );
                })}
              </select>
            )}

            {currentPanel === "dataDisplayFeatures" && (
              <div>
                <div style={styles.phraseBuilderLabel}>
                  {labelColumn}
                </div>
                <br />
                <div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    selectableLabels: getSelectableLabels(state),
    selectableFeatures: getSelectableFeatures(state),
    currentPanel: state.currentPanel
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
