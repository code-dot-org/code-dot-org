/* React component to handle displaying test data and A.I. Bot's guesses. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getConvertedAccuracyCheckExamples,
  getConvertedLabels,
  getAccuracyGrades,
  isRegression
} from "../redux";
import {
  styles,
  colors,
  ResultsGrades,
  REGRESSION_ERROR_TOLERANCE
} from "../constants";

class ResultsTable extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    accuracyCheckExamples: PropTypes.array,
    accuracyCheckLabels: PropTypes.array,
    accuracyCheckPredictedLabels: PropTypes.array,
    accuracyGrades: PropTypes.array,
    isRegression: PropTypes.bool
  };

  render() {
    const featureCount = this.props.selectedFeatures.length;

    return (
      <div style={styles.panel}>
        <div style={styles.tableParent}>
          <table style={styles.displayTable}>
            <thead>
              <tr>
                <th
                  colSpan={featureCount}
                  style={{
                    ...styles.tableHeader,
                    ...styles.resultsTableFirstHeader
                  }}
                >
                  <span style={styles.largeText}>
                    Features
                  </span>
                </th>
                <th
                  style={{
                    ...styles.tableHeader,
                    ...styles.resultsTableFirstHeader
                  }}
                >
                  <span style={styles.largeText}>{"Actual"}</span>
                  {this.props.isRegression && (
                    <div style={styles.smallTextNoMargin}>
                      {`+/- ${REGRESSION_ERROR_TOLERANCE}% of range`}
                    </div>
                  )}
                </th>
                <th
                  style={{
                    ...styles.tableHeader,
                    ...styles.resultsTableFirstHeader
                  }}
                >
                  <span style={styles.largeText}>{"A.I. Prediction"}</span>
                </th>
                <th
                  colSpan={featureCount}
                  style={{
                    ...styles.largeText,
                    ...styles.tableHeader,
                    ...styles.resultsTableFirstHeader
                  }}
                />
              </tr>
              <tr>
                {this.props.selectedFeatures.map((feature, index) => {
                  return (
                    <th
                      style={{
                        ...styles.tableHeader,
                        backgroundColor: colors.feature,
                        ...styles.resultsTableSecondHeader
                      }}
                      key={index}
                    >
                      {feature}
                    </th>
                  );
                })}
                <th
                  style={{
                    ...styles.tableHeader,
                    backgroundColor: colors.label,
                    ...styles.resultsTableSecondHeader
                  }}
                >
                  {this.props.labelColumn}
                </th>
                <th
                  style={{
                    ...styles.tableHeader,
                    backgroundColor: colors.label,
                    ...styles.resultsTableSecondHeader
                  }}
                >
                  {this.props.labelColumn}
                </th>
                <th
                  style={{
                    ...styles.tableHeader,
                    backgroundColor: colors.label,
                    ...styles.resultsTableSecondHeader
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {this.props.accuracyCheckExamples.map((examples, index) => {
                return (
                  <tr key={index}>
                    {examples.map((example, i) => {
                      return (
                        <td style={styles.tableCell} key={i}>
                          {example}
                        </td>
                      );
                    })}
                    <td style={styles.tableCell}>
                      {this.props.accuracyCheckLabels[index]}
                    </td>
                    <td style={styles.tableCell}>
                      {this.props.accuracyCheckPredictedLabels[index]}
                    </td>
                    {this.props.accuracyGrades[index] ===
                      ResultsGrades.CORRECT && (
                      <td style={{ ...styles.ready, ...styles.tableCell }}>
                        &#x2713;
                      </td>
                    )}
                    {this.props.accuracyGrades[index] ===
                      ResultsGrades.INCORRECT && (
                      <td style={{ ...styles.error, ...styles.tableCell }}>
                        &#10006;
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  selectedFeatures: state.selectedFeatures,
  labelColumn: state.labelColumn,
  accuracyCheckExamples: getConvertedAccuracyCheckExamples(state),
  accuracyCheckLabels: getConvertedLabels(state, state.accuracyCheckLabels),
  accuracyCheckPredictedLabels: getConvertedLabels(
    state,
    state.accuracyCheckPredictedLabels
  ),
  accuracyGrades: getAccuracyGrades(state),
  isRegression: isRegression(state)
}))(ResultsTable);
