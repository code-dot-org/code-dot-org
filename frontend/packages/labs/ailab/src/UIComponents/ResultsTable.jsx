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
import { styles, colors, ResultsGrades } from "../constants";

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
      <div style={styles.scrollableContents}>
        <table>
          <thead>
            <tr>
              <th colSpan={featureCount} style={styles.largeText}>
                Features
              </th>
              <th>
                <span style={styles.largeText}>{"A.I. Bot's Guess"}</span>
              </th>
              <th>
                <span style={styles.largeText}>{"Actual"}</span>
                {this.props.isRegression && (
                  <div style={styles.smallText}>{"+/- 3% of range"}</div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {this.props.selectedFeatures.map((feature, index) => {
                return (
                  <td style={{ backgroundColor: colors.feature }} key={index}>
                    {feature}
                  </td>
                );
              })}
              <td style={{ backgroundColor: colors.label }}>
                {this.props.labelColumn}
              </td>
              <td style={{ backgroundColor: colors.label }}>
                {this.props.labelColumn}
              </td>
            </tr>
            {this.props.accuracyCheckExamples.map((examples, index) => {
              return (
                <tr key={index}>
                  {examples.map((example, i) => {
                    return <td key={i}>{example}</td>;
                  })}
                  <td>{this.props.accuracyCheckPredictedLabels[index]}</td>
                  <td>{this.props.accuracyCheckLabels[index]}</td>
                  {this.props.accuracyGrades[index] ===
                    ResultsGrades.CORRECT && (
                    <td style={styles.ready}>&#x2713;</td>
                  )}
                  {this.props.accuracyGrades[index] ===
                    ResultsGrades.INCORRECT && (
                    <td style={styles.error}>&#10006;</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
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
