/* React component to handle showing details of numerical columns. */
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { getNumericalColumnDetails } from "../selectors/currentColumnSelectors";
import { numericalColumnDetailsShape } from "./shapes"
import I18n from "../i18n";

class ColumnDetailsNumerical extends Component {
  static propTypes = {
    columnDetails: numericalColumnDetailsShape
  };

  render() {
    const { extrema, containsOnlyNumbers } = this.props.columnDetails;

    return (
      <div>
        <div style={styles.bold}>{I18n.t("columnDetailsInformation")}</div>
        {!containsOnlyNumbers && (
          <p style={styles.error}>{I18n.t("columnDetailsNumericalTypeError")}</p>
        )}
        {containsOnlyNumbers && extrema && (
          <div style={styles.contents}>
            {I18n.t("columnDetailsMinimumValue")} {extrema.min}
            <br />
            {I18n.t("columnDetailsMaximumValue")} {extrema.max}
            <br />
            {I18n.t("columnDetailsValueRange")} {extrema.range}
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
