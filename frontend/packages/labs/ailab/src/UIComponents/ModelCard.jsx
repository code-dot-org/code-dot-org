/* React component to handle displaying the model card. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { getSummaryStat } from "../redux";

class ModelCard extends Component {
  static propTypes = {
    trainedModelDetails: PropTypes.object,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    metadata: PropTypes.object,
    summaryStat: PropTypes.object
  };

  render() {
    const {
      trainedModelDetails,
      labelColumn,
      selectedFeatures,
      metadata,
      summaryStat
    } = this.props;

    return (
      <div style={styles.panel}>
        <div style={styles.modelCardContainer}>
          <h3 style={styles.modelCardHeader}>{trainedModelDetails.name}</h3>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Summary</h5>
            <p style={styles.modelCardContent}>
              Predict {labelColumn} based on{" "}
              {selectedFeatures.length > 0 && (
                <span>
                  {selectedFeatures.join(", ")} with {summaryStat.stat}%
                  accuracy.
                </span>
              )}
            </p>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>About the Data </h5>
            <p style={styles.modelCardContent}>{metadata.card.description}</p>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Intended Use</h5>
            <p style={styles.modelCardContent}>
              {trainedModelDetails.potentialUses}{" "}
            </p>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Warnings</h5>
            <p style={styles.modelCardContent}>
              {trainedModelDetails.potentialMisuses}
            </p>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Label</h5>
            <p style={styles.modelCardContent}>{labelColumn}</p>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Features</h5>
            <p style={styles.modelCardContent}>{selectedFeatures.join(", ")}</p>
          </div>
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  trainedModelDetails: state.trainedModelDetails,
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
  metadata: state.metadata,
  summaryStat: getSummaryStat(state)
}))(ModelCard);
