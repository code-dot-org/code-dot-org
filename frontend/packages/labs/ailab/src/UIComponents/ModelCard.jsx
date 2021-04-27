/* React component to handle displaying the model card. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { getSummaryStat,
  getSelectedNumericalFeatures,
  getRangesByColumn,
  getSelectedCategoricalFeatures,
  getUniqueOptionsByColumn
} from "../redux";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";

class ModelCard extends Component {
  static propTypes = {
    trainedModelDetails: PropTypes.object,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    metadata: PropTypes.object,
    summaryStat: PropTypes.object,
    dataLength: PropTypes.number,
    selectedNumericalFeatures: PropTypes.array,
    rangesByColumn: PropTypes.object,
    selectedCategoricalFeatures: PropTypes.array,
    uniqueOptionsByColumn: PropTypes.object,
  };

  render() {
    const {
      trainedModelDetails,
      labelColumn,
      selectedFeatures,
      metadata,
      summaryStat,
      dataLength,
      selectedNumericalFeatures,
      selectedCategoricalFeatures,
      uniqueOptionsByColumn
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
            {dataLength !== 0 && (
              <p style={styles.modelCardContent}>
                <br />
                Dataset size: {dataLength} rows
              </p>
            )}
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Intended Use</h5>
            <p style={styles.modelCardContent}>
              {trainedModelDetails.potentialUses}
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
            <p style={styles.modelCardContent}>
            <p style={styles.bold}>{labelColumn}</p>
              {metadata.fields.find(field => field.id === labelColumn).description}
            </p>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Features</h5>
            <p style={styles.modelCardContent}>
            {selectedNumericalFeatures.map((feature, index) => {
              let min = this.props.rangesByColumn[feature].min.toFixed(2);
              let max = this.props.rangesByColumn[feature].max.toFixed(2);
              let selectedFeature = metadata.fields.find(field => field.id === feature);
              return (
                <div key={index}>
                <p styles={styles.bold}>
                  {feature}
                </p>
                <p>{selectedFeature.description}</p>
                <p>Possible Values: <br />
                  min: {min}, max: {max}
                </p>
                </div>
              );
            })}
            {selectedCategoricalFeatures.map ((feature, index) => {
              let selectedFeature = metadata.fields.find(field => field.id === feature);
              return (
                <div key={index}>
                  <p styles={styles.bold}>
                  {feature}
                  </p>
                  <p>{selectedFeature.description}</p>
                  <p>Possible Values:{" "}
                    {uniqueOptionsByColumn[feature].join(", ")}
                  </p>
                </div>
              );
            })}
           </p>
        </div>
        </div>
        <div style={styles.summaryScreenBot}>
          <img
            src={aiBotHead}
            style={{
              ...styles.trainBotHead,
              ...(false && styles.trainBotOpen)
            }}
          />
          <img src={aiBotBody} style={styles.trainBotBody} />
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
  summaryStat: getSummaryStat(state),
  dataLength: state.data.length,
  selectedNumericalFeatures: getSelectedNumericalFeatures(state),
  rangesByColumn: getRangesByColumn(state),
  selectedCategoricalFeatures: getSelectedCategoricalFeatures(state),
  uniqueOptionsByColumn: getUniqueOptionsByColumn(state),
}))(ModelCard);
