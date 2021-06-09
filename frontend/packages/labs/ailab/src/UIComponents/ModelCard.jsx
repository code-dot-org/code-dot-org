/* React component to handle displaying the model card. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import {
  getPercentCorrect,
  getColumnDataToSave,
  getFeaturesToSave,
  getDatasetDetails
} from "../redux";
import Statement from "./Statement";
import aiBotBorder from "@public/images/ai-bot/ai-bot-border.png";

class ModelCard extends Component {
  static propTypes = {
    trainedModelDetails: PropTypes.object,
    selectedFeatures: PropTypes.array,
    percentCorrect: PropTypes.number,
    label: PropTypes.object,
    feature: PropTypes.array,
    datasetDetails: PropTypes.object
  };

  render() {
    const {
      trainedModelDetails,
      selectedFeatures,
      percentCorrect,
      label,
      feature,
      datasetDetails
    } = this.props;

    return (
      <div style={styles.panel}>
        <Statement />
        <div style={styles.summaryScreenBot}>
          <img
            src={aiBotBorder}
            className="ailab-image-hover"
            style={styles.summaryScreenBotImage}
          />
        </div>
        <div style={styles.modelCardContainer}>
          <h3 style={styles.modelCardHeader}>{trainedModelDetails.name}</h3>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Summary</h5>
            <div style={styles.modelCardContent}>
              <p style={styles.modelCardDetails}>
                Predict {label.id} based on{" "}
                {selectedFeatures.length > 0 && percentCorrect && (
                  <span>
                    {selectedFeatures.join(", ")} with {percentCorrect}%
                    accuracy.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>About the Data </h5>
            <div style={styles.modelCardContent}>
              {datasetDetails.description && (
                <p style={styles.modelCardDetails}>
                  {datasetDetails.description}
                </p>
              )}
              {datasetDetails.numRows && (
                <p style={styles.modelCardDetails}>
                  Dataset size: {datasetDetails.numRows} rows
                </p>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Intended Use</h5>
            <div style={styles.modelCardContent}>
              {trainedModelDetails.potentialUses && (
                <p style={styles.modelCardDetails}>
                  {trainedModelDetails.potentialUses}
                </p>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Warnings</h5>
            <div style={styles.modelCardContent}>
              {trainedModelDetails.potentialMisuses && (
                <p style={styles.modelCardDetails}>
                  {trainedModelDetails.potentialMisuses}
                </p>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Label</h5>
            <div style={styles.modelCardContent}>
              <p style={styles.bold}>{label.id}</p>
              {label.description && <p>{label.description}</p>}
              {!label.values && (
                <p style={styles.modelCardDetails}>
                  Possible Values:
                  <br />
                  min: {label.min}, max: {label.max}
                </p>
              )}
              {label.values && (
                <p style={styles.modelCardDetails}>
                  Possible Values: {label.values.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Features</h5>
            <div style={styles.modelCardContent}>
              {feature.length > 0 &&
                feature.map((feature, index) => {
                  return (
                    <div key={index}>
                      <p style={styles.bold}>{feature.id}</p>
                      {feature.description && <p>{feature.description}</p>}
                      {!feature.values && (
                        <p>
                          Possible Values:
                          <br />
                          min: {feature.min}, max: {feature.max}
                        </p>
                      )}
                      {feature.values && (
                        <p>Possible Values: {feature.values.join(", ")}</p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  trainedModelDetails: state.trainedModelDetails,
  selectedFeatures: state.selectedFeatures,
  percentCorrect: getPercentCorrect(state),
  label: getColumnDataToSave(state, state.labelColumn),
  feature: getFeaturesToSave(state),
  datasetDetails: getDatasetDetails(state)
}))(ModelCard);
