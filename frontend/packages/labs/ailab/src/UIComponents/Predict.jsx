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
  getExtremaByColumn
} from "../redux";
import { styles } from "../constants";
import aiBotBorder from "@public/images/ai-bot/ai-bot-border.png";

class Predict extends Component {
  static propTypes = {
    labelColumn: PropTypes.string,
    selectedCategoricalFeatures: PropTypes.array,
    selectedNumericalFeatures: PropTypes.array,
    uniqueOptionsByColumn: PropTypes.object,
    testData: PropTypes.object,
    setTestData: PropTypes.func.isRequired,
    predictedLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    getPredictAvailable: PropTypes.bool,
    extremaByColumn: PropTypes.object
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
                let min = this.props.extremaByColumn[feature].min.toFixed(2);
                let max = this.props.extremaByColumn[feature].max.toFixed(2);

                return (
                  <div style={styles.cardRow} key={index}>
                    <label>
                      {feature}
                      : &nbsp;
                      <input
                        type="number"
                        onChange={event => this.handleChange(event, feature)}
                        value={this.props.testData[feature] || ""}
                        placeholder={`min: ${+min}, max: ${+max}`}
                      />
                    </label>
                  </div>
                );
              })}
            </form>
            <form>
              {this.props.selectedCategoricalFeatures.map((feature, index) => {
                return (
                  <div style={styles.cardRow} key={index}>
                    <div>{feature}: &nbsp;</div>
                    <div>
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
                    </div>
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
          <div style={styles.contentsPredictBot}>
            <div style={styles.predictBotLeft}>
              <img style={styles.predictBot} src={aiBotBorder} />
            </div>
            <div style={styles.predictBotRight}>
              <div style={styles.statement}>A.I. predicts</div>
              {this.props.labelColumn}: {this.props.predictedLabel}
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
    labelColumn: state.labelColumn,
    selectedNumericalFeatures: getSelectedNumericalFeatures(state),
    selectedCategoricalFeatures: getSelectedCategoricalFeatures(state),
    uniqueOptionsByColumn: getUniqueOptionsByColumn(state),
    getPredictAvailable: getPredictAvailable(state),
    extremaByColumn: getExtremaByColumn(state)
  }),
  dispatch => ({
    setTestData(testData) {
      dispatch(setTestData(testData));
    }
  })
)(Predict);
