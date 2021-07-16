/* React component to display a statement about our model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setLabelColumn, removeSelectedFeature } from "../redux";
import { styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

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

    return (
      <div
        style={smallFont ? styles.statementSmall : styles.statement}
        id="statement"
      >
        Predict{" "}
        <div style={styles.statementLabel}>
          {labelColumn || "____"}
          {currentPanel === "dataDisplayLabel" && labelColumn && (
            <div
              id="remove-statement-label"
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
        {currentPanel !== "dataDisplayLabel" && (
          <span>
            {" "}
            based on{" "}
            {selectedFeatures.map((selectedFeature, index) => {
              return (
                <span key={index}>
                  <div style={styles.statementFeature}>
                    {selectedFeature}
                    {currentPanel === "dataDisplayFeatures" && (
                      <div
                        id="remove-statement-feature"
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
            .
          </span>
        )}
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
