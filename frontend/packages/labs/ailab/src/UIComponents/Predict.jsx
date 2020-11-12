/* React component to handle predicting and displaying predictions. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train from "../train";
import {
  setTestData,
  getSelectedContinuousFeatures,
  getSelectedCategoricalFeatures,
  getUniqueOptionsByColumn,
  getConvertedPredictedLabel
} from "../redux";
import { styles } from "../constants";

class Predict extends Component {
  static propTypes = {
    showPredict: PropTypes.bool,
    labelColumn: PropTypes.string,
    selectedCategoricalFeatures: PropTypes.array,
    selectedContinuousFeatures: PropTypes.array,
    uniqueOptionsByColumn: PropTypes.object,
    testData: PropTypes.object,
    setTestData: PropTypes.func.isRequired,
    predictedLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    confidence: PropTypes.number
  };

  handleChange = (event, feature) => {
    const testData = this.props.testData;
    testData[feature] = event.target.value;
    this.props.setTestData(testData);
  };

  onClickPredict = () => {
    train.onClickPredict();
  };

  render() {
    return (
      <div id="predict">
        {this.props.showPredict && (
          <div style={styles.panel}>
            <div style={styles.largeText}>Test the Model</div>
            <form>
              {this.props.selectedContinuousFeatures.map((feature, index) => {
                return (
                  <div key={index}>
                    <label>
                      {feature}:
                      <input
                        type="text"
                        onChange={event => this.handleChange(event, feature)}
                      />
                    </label>
                  </div>
                );
              })}
            </form>
            <br />
            <form>
              {this.props.selectedCategoricalFeatures.map((feature, index) => {
                return (
                  <span key={index}>
                    <label>
                      {feature}:
                      <select
                        onChange={event => this.handleChange(event, feature)}
                      >
                        <option>{""}</option>
                        {this.props.uniqueOptionsByColumn[feature]
                          .sort()
                          .map((option, index) => {
                            return (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            );
                          })}
                      </select>
                    </label>
                  </span>
                );
              })}
            </form>
            <br />
            <button type="button" onClick={this.onClickPredict}>
              Predict!
            </button>
            <p />
            {this.props.predictedLabel && (
              <div>
                <div> The Machine Learning model predicts... </div>
                <div style={styles.subPanel}>
                  {this.props.labelColumn}: {this.props.predictedLabel}
                  {this.props.confidence && (
                    <p>Confidence: {this.props.confidence}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    showPredict: state.showPredict,
    testData: state.testData,
    predictedLabel: getConvertedPredictedLabel(state),
    confidence: state.prediction.confidence,
    labelColumn: state.labelColumn,
    selectedContinuousFeatures: getSelectedContinuousFeatures(state),
    selectedCategoricalFeatures: getSelectedCategoricalFeatures(state),
    uniqueOptionsByColumn: getUniqueOptionsByColumn(state)
  }),
  dispatch => ({
    setTestData(testData) {
      dispatch(setTestData(testData));
    }
  })
)(Predict);
