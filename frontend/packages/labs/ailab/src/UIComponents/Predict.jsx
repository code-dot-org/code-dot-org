/* React component to handle predicting and displaying predictions. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train from "../train";
import {
  setTestData,
  getSelectedNumericalFeatures,
  getSelectedCategoricalFeatures,
  getUniqueOptionsByColumn,
  getConvertedPredictedLabel,
  getPredictAvailable,
  getRangesByColumn
} from "../redux";
import { styles } from "../constants";

class Predict extends Component {
  static propTypes = {
    labelColumn: PropTypes.string,
    selectedCategoricalFeatures: PropTypes.array,
    selectedNumericalFeatures: PropTypes.array,
    uniqueOptionsByColumn: PropTypes.object,
    testData: PropTypes.object,
    setTestData: PropTypes.func.isRequired,
    predictedLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    confidence: PropTypes.number,
    getPredictAvailable: PropTypes.bool,
    rangesByColumn: PropTypes.object
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
      <div id="predict" style={{ ...styles.panel, ...styles.rightPanel }}>
        <div style={styles.largeText}>Try it out!</div>
        <div style={styles.scrollableContents}>
          <div style={styles.scrollingContents}>
            <form>
              {this.props.selectedNumericalFeatures.map((feature, index) => {
                let min = this.props.rangesByColumn[feature].min.toFixed(2);
                let max = this.props.rangesByColumn[feature].max.toFixed(2);

                return (
                  <div style={styles.cardRow} key={index}>
                    <label>
                      {feature} {`(min: ${+min}, max: ${+max})`}
                      : &nbsp;
                      <input
                        type="number"
                        onChange={event => this.handleChange(event, feature)}
                        value={this.props.testData[feature]}
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
                  <div style={styles.cardRow} key={index}>
                    <label>
                      {feature}: &nbsp;
                      <select
                        onChange={event => this.handleChange(event, feature)}
                        value={this.props.testData[feature]}
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
                  </div>
                );
              })}
            </form>
          </div>
        </div>
        <br />
        <div>
          <button
            type="button"
            style={
              !this.props.getPredictAvailable
                ? styles.disabledButton
                : undefined
            }
            onClick={this.onClickPredict}
            disabled={!this.props.getPredictAvailable}
          >
            Predict
          </button>
        </div>
        {this.props.predictedLabel && (
          <div>
            <p />
            <div>A.I. predicts:</div>
            <div style={styles.contents}>
              {this.props.labelColumn}: {this.props.predictedLabel}
              {this.props.confidence && (
                <p>Confidence: {this.props.confidence}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    testData: state.testData,
    predictedLabel: getConvertedPredictedLabel(state),
    confidence: state.prediction.confidence,
    labelColumn: state.labelColumn,
    selectedNumericalFeatures: getSelectedNumericalFeatures(state),
    selectedCategoricalFeatures: getSelectedCategoricalFeatures(state),
    uniqueOptionsByColumn: getUniqueOptionsByColumn(state),
    getPredictAvailable: getPredictAvailable(state),
    rangesByColumn: getRangesByColumn(state)
  }),
  dispatch => ({
    setTestData(testData) {
      dispatch(setTestData(testData));
    }
  })
)(Predict);
