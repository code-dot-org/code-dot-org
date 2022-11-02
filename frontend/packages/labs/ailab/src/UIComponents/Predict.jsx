/* React component to handle predicting and displaying predictions. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { store } from "../index.js";
import train from "../train";
import { setTestData, getPredictAvailable } from "../redux";
import { getConvertedPredictedLabel } from "../helpers/valueConversion";
import {
  getSelectedCategoricalFeatures,
  getSelectedNumericalFeatures,
  getUniqueOptionsByColumn,
  getExtremaByColumn
} from "../selectors";
import { styles } from "../constants";
import aiBotBorder from "@public/images/ai-bot/ai-bot-border.png";
import ScrollableContent from "./ScrollableContent";
import I18n from "../i18n";

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
    this.props.setTestData(feature, event.target.value);
  };

  onClickPredict = () => {
    train.onClickPredict(store);
  };

  render() {
    return (
      <div id="predict" style={{ ...styles.panel, ...styles.rightPanel }}>
        <div style={styles.largeText}>{I18n.t("predictHeader")}</div>
        <ScrollableContent>
          <div>
            {this.props.selectedNumericalFeatures.map((feature, index) => {
              let min = this.props.extremaByColumn[feature].min.toFixed(2);
              let max = this.props.extremaByColumn[feature].max.toFixed(2);

              return (
                <div style={styles.cardRow} key={index}>
                  <label>
                    {feature}
                    &nbsp;
                    <input
                      type="number"
                      onChange={event => this.handleChange(event, feature)}
                      value={this.props.testData[feature] || ""}
                      placeholder={I18n.t(
                        "predictPlaceholder",
                        {"minimum": +min, "maximum": +max})}
                    />
                  </label>
                </div>
              );
            })}
          </div>
          <div>
            {this.props.selectedCategoricalFeatures.map((feature, index) => {
              return (
                <div style={styles.cardRow} key={index}>
                  <div>{feature}&nbsp;</div>
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
          </div>
        </ScrollableContent>
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
            {I18n.t("predictButton")}
          </button>
        </div>
        {this.props.predictedLabel && (
          <div style={styles.contentsPredictBot}>
            <div style={styles.predictBotLeft}>
              <img
                className="ailab-image-hover"
                style={styles.predictBot}
                src={aiBotBorder}
                alt={I18n.t("aiBotAltText")}
              />
            </div>
            <div style={styles.predictBotRight}>
              <div style={styles.statement}>{I18n.t("predictAIBotPredicts")}</div>
              <div>{this.props.labelColumn}</div>
              <div>{this.props.predictedLabel}</div>
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
    setTestData(feature, value) {
      dispatch(setTestData(feature, value));
    }
  })
)(Predict);
