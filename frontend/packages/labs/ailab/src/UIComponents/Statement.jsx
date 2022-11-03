/* React component to display a statement about our model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setLabelColumn, removeSelectedFeature } from "../redux";
import { styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import I18n from "../i18n";

class Statement extends Component {
  static propTypes = {
    shouldShow: PropTypes.bool,
    smallFont: PropTypes.bool,
    data: PropTypes.array,
    currentPanel: PropTypes.string,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    setLabelColumn: PropTypes.func,
    removeSelectedFeature: PropTypes.func
  };

  removeLabel = () => {
    this.props.setLabelColumn(null);
  };

  removeFeature = id => {
    this.props.removeSelectedFeature(id);
  };

  labelHTML = (label , currentPanel) => {
    return (
      <div style={styles.statementLabel}>
        {label || "____"}
        {label && currentPanel === "dataDisplayLabel" && (
          <div
            id="uitest-remove-statement-label"
            onClick={() => this.removeLabel()}
            onKeyDown={() => this.removeLabel()}
            style={styles.statementDeleteIcon}
            role="button"
            tabIndex={0}
          >
            <div style={styles.statementDeleteCircle} />
            <div style={styles.statementDeleteX}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
          </div>
        )}
      </div>
    );
  };

  selectedFeaturesHTML = (selectedFeatures, currentPanel) => {
    return (
      <span>
        {selectedFeatures.map((selectedFeature, index) => {
          return (
            <span key={index}>
              <div style={styles.statementFeature}>
                {selectedFeature}
                {currentPanel === "dataDisplayFeatures" && (
                  <div
                    id="uitest-remove-statement-feature"
                    onClick={() => this.removeFeature(selectedFeature)}
                    onKeyDown={() => this.removeFeature(selectedFeature)}
                    style={styles.statementDeleteIcon}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.statementDeleteCircle} />
                    <div style={styles.statementDeleteX}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </div>
                  </div>
                )}
              </div>
              {index < selectedFeatures.length - 1 && ", "}
                </span>
          );
        })}
        {selectedFeatures.length === 0 && (
          <span style={styles.statementFeature}>____</span>
        )}
      </span>
    );
  }

  render() {
    const {
      shouldShow,
      smallFont,
      labelColumn,
      selectedFeatures,
      currentPanel
    } = this.props;

    if (!shouldShow) {
      return null;
    }

    // Placeholders put into the "predictionStatement" string which will be replaced with React
    // components.
    // This placeholder system is necessary because different languages will order the words in
    // the sentence differently. Since we can't predict what order the react components will be
    // in, we need to use placeholders in the plaintext string.
    const OUTPUT_KEY = "__CDO_OUTPUT__";
    const INPUTS_KEY = "__CDO_INPUTS__";
    // The "Predict ___ based on ___" sentence translators receive. The OUTPUT and INPUTS
    // placeholders will be replaced with React components.
    const predictionStatement = I18n.t("predictionStatement",
      {"output": OUTPUT_KEY, "inputs": INPUTS_KEY});
    // Regex to split the "Predict..." statement and isolate the dynamic content parts.
    // "Predict __CDO_OUTPUT__ based on __CDO_INPUTS__" becomes
    // ["Predict ", "__CDO_OUTPUT__", " based on ", "__CDO_INPUTS__"]
    const regex = new RegExp(`(${OUTPUT_KEY}|${INPUTS_KEY})`);
    const predictionStatementParts = predictionStatement.split(regex).filter((part) => part);
    // Swap the OUTPUT and INPUTS placeholders with React components.
    const predictionStatementComponents = predictionStatementParts.map((part, index) => {
      if (part === OUTPUT_KEY) {
        return this.labelHTML(labelColumn, currentPanel);
      } else if (part === INPUTS_KEY) {
        return this.selectedFeaturesHTML(selectedFeatures, currentPanel);
      } else {
        return part;
      }
    }).map((part, index) => {
      // React wants sibling elements in a list to have a unique "key".
      return (<span key={index}>{part}</span>);
    });

    return (
      <div
        style={smallFont ? styles.statementSmall : styles.statement}
        id="statement"
      >
        {predictionStatementComponents}
      </div>
    );
  }
}

export const UnconnectedStatement = Statement;

export default connect(
  state => ({
    shouldShow: state.data.length !== 0,
    data: state.data,
    currentPanel: state.currentPanel,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures
  }),
  dispatch => ({
    setLabelColumn(labelColumn) {
      dispatch(setLabelColumn(labelColumn));
    },
    removeSelectedFeature(labelColumn) {
      dispatch(removeSelectedFeature(labelColumn));
    }
  })
)(Statement);
