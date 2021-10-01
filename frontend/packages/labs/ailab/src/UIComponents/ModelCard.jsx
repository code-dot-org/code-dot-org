/* React component to handle displaying the model card. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { getLabelToSave, getFeaturesToSave } from "../redux";
import { getPercentCorrect } from "../helpers/accuracy";
import { getDatasetDetails } from "../helpers/datasetDetails";
import Statement from "./Statement";
import aiBotBorder from "@public/images/ai-bot/ai-bot-border.png";
import { modelCardDatasetDetailsShape, trainedModelDetailsShape, modelCardLabelShape } from "./shapes";

class ModelCard extends Component {
  static propTypes = {
    trainedModelDetails: trainedModelDetailsShape,
    selectedFeatures: PropTypes.array,
    percentCorrect: PropTypes.number,
    label: modelCardLabelShape,
    feature: PropTypes.array,
    datasetDetails: modelCardDatasetDetailsShape
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
            alt="A.I. bot"
          />
        </div>
        <div id="uitest-model-card" style={styles.modelCardContainer}>
          <h3 style={styles.modelCardHeader}>{trainedModelDetails.name}</h3>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Accuracy</h5>
            <div style={styles.modelCardContent}>
              <p style={styles.modelCardDetails}>
                <span>
                  {percentCorrect}%
                </span>
              </p>
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
            <h5 style={styles.modelCardHeading}>Limitations and Warnings</h5>
            <div style={styles.modelCardContent}>
              {trainedModelDetails.potentialMisuses && (
                <p style={styles.modelCardDetails}>
                  {trainedModelDetails.potentialMisuses}
                </p>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>About the Data</h5>
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
            <h5 style={styles.modelCardHeading}>Features and Label</h5>
            <div style={styles.modelCardContent}>
              <p style={styles.modelCardDetails}>
                Predict {label.id} based on{" "}
                {selectedFeatures.length > 0 && (
                  <span>
                    {selectedFeatures.join(", ")}.
                  </span>
                )}
              </p>
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
  label: getLabelToSave(state),
  feature: getFeaturesToSave(state),
  datasetDetails: getDatasetDetails(state)
}))(ModelCard);
