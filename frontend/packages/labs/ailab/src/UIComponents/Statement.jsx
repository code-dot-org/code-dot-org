/* React component to display a statement about our model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setLabelColumn,
  removeSelectedFeature
} from "../redux";
import { styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

class Statement extends Component {
  static propTypes = {
    data: PropTypes.array,
    currentPanel: PropTypes.string,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    setLabelColumn: PropTypes.func.isRequired,
    removeSelectedFeature: PropTypes.func.isRequired
  };

  removeLabel = () => {
    this.props.setLabelColumn(null);
  };

  removeFeature = (id) => {
    this.props.removeSelectedFeature(id);
  };

  render() {
    const { data, labelColumn, selectedFeatures, currentPanel } = this.props;

    if (data.length === 0) {
      return null;
    }

    return (
      <div style={styles.statement} id="statement">
        Predict{" "}
        <div style={styles.statementLabel}>
          {labelColumn || "..."}
          {currentPanel === "dataDisplayLabel" && labelColumn && (
            <div
              onClick={() => this.removeLabel()}
              style={styles.statementDeleteIcon}
            >
              <div style={styles.statementDeleteCircle} />
              <div style={styles.statementDeleteX}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </div>
            </div>
          )}
        </div>
        <span>
          {" "}
          based on{" "}
          {selectedFeatures.map((selectedFeature, index) => {
            return (
              <span>
                <div style={styles.statementFeature}>
                  {selectedFeature}
                  {currentPanel === "dataDisplayFeatures" && (
                    <div
                      onClick={() => this.removeFeature(selectedFeature)}
                      style={styles.statementDeleteIcon}
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
            <span style={styles.statementFeature}>...</span>
          )}
          {selectedFeatures.length !== 0 && "."}
        </span>
      </div>
    );
  }
}

export default connect(
  state => ({
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
