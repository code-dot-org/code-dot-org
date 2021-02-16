/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getConvertedAccuracyCheckExamples,
  getConvertedLabels,
  getSummaryStat
} from "../redux";
import { styles, MLTypes } from "../constants";

class Results extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    percentDataToReserve: PropTypes.number,
    summaryStat: PropTypes.object,
    accuracyCheckExamples: PropTypes.array,
    accuracyCheckLabels: PropTypes.array,
    accuracyCheckPredictedLabels: PropTypes.array
  };

  render() {
    return (
      <div id="results">
        <div style={styles.panel}>
          <p>
            {this.props.percentDataToReserve}% of the training data was reserved
            to test the accuracy of the newly trained model.
          </p>
          {isNaN(this.props.summaryStat.stat) && (
            <p>
              An accuracy score was not calculated because no training data was
              reserved for testing.
            </p>
          )}
          <div>
            {this.props.summaryStat.type === MLTypes.REGRESSION &&
              !isNaN(this.props.summaryStat.stat) && (
                <div>
                  <div>
                    The average difference between expected and predicted labels
                    is:
                  </div>
                  <div style={styles.subPanel}>
                    {this.props.summaryStat.stat}
                  </div>
                </div>
              )}
            {this.props.summaryStat.type === MLTypes.CLASSIFICATION &&
              !isNaN(this.props.summaryStat.stat) && (
                <div>
                  <div style={styles.mediumText}>
                    The calculated accuracy of this model is:
                  </div>
                  <div style={styles.subPanel}>
                    {this.props.summaryStat.stat}%
                  </div>
                </div>
              )}
            <br />
            <br />
          </div>
          {!isNaN(this.props.summaryStat.stat) && (
            <div style={styles.subPanel}>
              <table>
                <thead>
                  <tr>
                    {this.props.selectedFeatures.map((feature, index) => {
                      return <th key={index}>{feature}</th>;
                    })}
                    <th>Expected Label: {this.props.labelColumn}</th>
                    <th>Predicted Label: {this.props.labelColumn}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.accuracyCheckExamples.map((examples, index) => {
                    return (
                      <tr key={index}>
                        {examples.map((example, i) => {
                          return <td key={i}>{example}</td>;
                        })}
                        <td>{this.props.accuracyCheckLabels[index]}</td>
                        <td>
                          {this.props.accuracyCheckPredictedLabels[index]}
                        </td>
                        {this.props.accuracyCheckLabels[index] ===
                          this.props.accuracyCheckPredictedLabels[index] && (
                          <td style={styles.ready}>&#x2713;</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  selectedFeatures: state.selectedFeatures,
  labelColumn: state.labelColumn,
  summaryStat: getSummaryStat(state),
  accuracyCheckExamples: getConvertedAccuracyCheckExamples(state),
  accuracyCheckLabels: getConvertedLabels(state, state.accuracyCheckLabels),
  accuracyCheckPredictedLabels: getConvertedLabels(
    state,
    state.accuracyCheckPredictedLabels
  ),
  percentDataToReserve: state.percentDataToReserve
}))(Results);
