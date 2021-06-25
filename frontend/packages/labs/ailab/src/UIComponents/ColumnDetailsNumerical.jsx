/* React component to handle showing details of numerical columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { styles } from "../constants";

export default class ColumnDetailsNumerical extends Component {
  static propTypes = {
    isColumnDataValid: PropTypes.bool,
    extrema: PropTypes.object
  };

  render() {
    const { isColumnDataValid, extrema } = this.props;

    return (
      <div>
        <div style={styles.bold}>Column information:</div>
        {!isColumnDataValid && (
          <p style={styles.error}>
            Numerical columns cannot contain strings.
          </p>
        )}
        {isColumnDataValid && (
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
};
