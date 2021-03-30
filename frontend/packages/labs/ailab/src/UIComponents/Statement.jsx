/* React component to display a statement about our model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";

class Statement extends Component {
  static propTypes = {
    data: PropTypes.array,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array
  };

  render() {
    const {
      data,
      labelColumn,
      selectedFeatures
    } = this.props;

    if (data.length === 0) {
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
              : ".."}
          </span>
          {"."}
        </span>
      </div>
    );
  }
}

export default connect(
  state => ({
    data: state.data,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures
  })
)(Statement);
