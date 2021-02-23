/* React component to handle displaying test data and A.I. Bot's guesses. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getConvertedAccuracyCheckExamples,
  getConvertedLabels
} from "../redux";
import { styles, colors } from "../constants";

class ResultsTable extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    accuracyCheckExamples: PropTypes.array,
    accuracyCheckLabels: PropTypes.array,
    accuracyCheckPredictedLabels: PropTypes.array
  };

  render() {
    return (
      <div>
        <div style={styles.floatLeft}>
          <span style={styles.largeText}>Features</span>
          <table>
            <thead>
              <tr style={{ backgroundColor: colors.feature }}>
                {this.props.selectedFeatures.map((feature, index) => {
                  return <th key={index}>{feature}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {this.props.accuracyCheckExamples.map((examples, index) => {
                return (
                  <tr key={index}>
                    {examples.map((example, i) => {
                      return <td key={i}>{example}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={styles.floatLeft}>
          <span style={styles.largeText}>{"A.I. Bot's Guess"}</span>
          <table>
            <thead>
              <tr style={{ backgroundColor: colors.label }}>
                <th>{this.props.labelColumn}</th>
              </tr>
            </thead>
            <tbody>
              {this.props.accuracyCheckExamples.map((examples, index) => {
                return (
                  <tr key={index}>
                    <td>{this.props.accuracyCheckPredictedLabels[index]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={styles.floatLeft}>
          <span style={styles.largeText}>{"Actual"}</span>
          <table>
            <thead>
              <tr style={{ backgroundColor: colors.label }}>
                <th>{this.props.labelColumn}</th>
              </tr>
            </thead>
            <tbody>
              {this.props.accuracyCheckExamples.map((examples, index) => {
                return (
                  <tr key={index}>
                    <td>{this.props.accuracyCheckLabels[index]}</td>
                    {this.props.accuracyCheckLabels[index] ===
                      this.props.accuracyCheckPredictedLabels[index] && (
                      <td style={styles.ready}>&#x2713;</td>
                    )}
                    {this.props.accuracyCheckLabels[index] !==
                      this.props.accuracyCheckPredictedLabels[index] && (
                      <td style={styles.error}>&#10006;</td>
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
  )
}))(ResultsTable);
