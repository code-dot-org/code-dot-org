/* React component to handle showing details of numerical columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { getNumericalColumnDetails } from "../selectors";

class ColumnDetailsNumerical extends Component {
  static propTypes = {
    columnDetails: PropTypes.object
  };

  render() {
    const { extrema, containsOnlyNumbers } = this.props.columnDetails;

    return (
      <div>
        <div style={styles.bold}>Column information:</div>
        {!containsOnlyNumbers && (
          <p style={styles.error}>
            Numerical columns cannot contain strings.
          </p>
        )}
        {containsOnlyNumbers && extrema && (
          <div style={styles.contents}>
            min: {extrema.min}
            <br />
            max: {extrema.max}
            <br />
            range: {extrema.range}
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    columnDetails: getNumericalColumnDetails(state)
  })
)(ColumnDetailsNumerical);
