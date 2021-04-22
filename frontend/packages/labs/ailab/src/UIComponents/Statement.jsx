/* React component to display a statement about our model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";

class Statement extends Component {
  static propTypes = {
    shouldShow: PropTypes.bool,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array
  };

  render() {
    const {
      shouldShow,
      labelColumn,
      selectedFeatures
    } = this.props;

    if (!shouldShow) {
      return null;
    }

    return (
      <div style={styles.statement} id="statement">
        Predict{" "}
        <span style={styles.statementLabel}>
          {labelColumn || "..."}
        </span>
        <span>
          {" "}
          based on{" "}
          <span style={styles.statementFeature}>
            {selectedFeatures.length > 0
              ? selectedFeatures.join(", ")
              : "..."}
          </span>
          {selectedFeatures.length > 0 && (
            "."
          )}
        </span>
      </div>
    );
  }
}

export const UnconnectedStatement = Statement;

export default connect(
  state => ({
    shouldShow: state.data.length !== 0,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures
  })
)(Statement);
