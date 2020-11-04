/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getAccuracy, getConvertedLabels } from "../redux";

class Results extends Component {
  static propTypes = {
    showPredict: PropTypes.bool,
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    percentDataToReserve: PropTypes.number,
    accuracy: PropTypes.string,
    accuracyCheckExamples: PropTypes.array,
    accuracyCheckLabels: PropTypes.array,
    accuracyCheckPredictedLabels: PropTypes.array
  };

  render() {
    return (
      <div>
        {this.props.showPredict &&
          this.props.percentDataToReserve > 0 &&
          this.props.accuracyCheckExamples.length > 0 && (
            <div>
              <p>
                {this.props.percentDataToReserve}% of the training data was
                reserved to test the accuracy of the newly trained model.
              </p>
              <div>
                <h3>The calculated accuracy of this model is:</h3>
                {this.props.accuracy}%
              </div>
              <div>
                <table>
                  <thead>
                    <tr>
                      {this.props.selectedFeatures.map((feature, index) => {
                        return <th key={index}>{feature}</th>;
                      })}
                      <th>Expected Label</th>
                      <th>Predicted Label</th>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default connect(
  state => ({
    showPredict: state.showPredict,
    selectedFeatures: state.selectedFeatures,
    labelColumn: state.labelColumn,
    accuracy: getAccuracy(state),
    accuracyCheckExamples: state.accuracyCheckExamples,
    accuracyCheckLabels: getConvertedLabels(state, state.accuracyCheckLabels),
    accuracyCheckPredictedLabels: getConvertedLabels(
      state,
      state.accuracyCheckPredictedLabels
    ),
    percentDataToReserve: state.percentDataToReserve
  }),
  dispatch => ({
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    },
    setPercentDataToReserve(percentDataToReserve) {
      dispatch(setPercentDataToReserve(percentDataToReserve));
    }
  })
)(Results);
