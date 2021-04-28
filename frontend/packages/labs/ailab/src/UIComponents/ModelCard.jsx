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

    const card = metadata && metadata.card;

    let labelDescription = metadata.fields.find(field => field.id === labelColumn).description

    return (
      <div style={styles.panel}>
        <div style={styles.modelCardContainer}>
          <h3 style={styles.modelCardHeader}>{trainedModelDetails.name}</h3>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Summary</h5>
            <div style={styles.modelCardContent}>
              Predict {labelColumn} based on{" "}
              {selectedFeatures.length > 0 && summaryStat && (
                <span>
                  {selectedFeatures.join(", ")} with {summaryStat.stat}%
                  accuracy.
                </span>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>About the Data </h5>
            <div style={styles.modelCardContent}>
              {card && (
                <p>{metadata.card.description}</p>
              )}
              {dataLength !== 0 && (
                <div style={styles.modelCardContent}>
                  <br />
                  Dataset size: {dataLength} rows
                </div>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Intended Use</h5>
            <div style={styles.modelCardContent}>
              {trainedModelDetails.potentialUses && (
                <p>{trainedModelDetails.potentialUses}</p>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Warnings</h5>
            <div style={styles.modelCardContent}>
              {trainedModelDetails.potentialMisuses && (
                <p>{trainedModelDetails.potentialMisuses}</p>
              )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Label</h5>
            <div style={styles.modelCardContent}>
              <div style={styles.bold}>{labelColumn}</div>
                {labelDescription && (
                  <p>{labelDescription}</p>
                )}
            </div>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Features</h5>
            {selectedNumericalFeatures.length > 0 && (
              <div style={styles.modelCardContent}>
                {selectedNumericalFeatures.map((feature, index) => {
                  // toFixed converts a number to a string and rounds to two decimal places.
                  let min = this.props.rangesByColumn[feature].min.toFixed(2);
                  let max = this.props.rangesByColumn[feature].max.toFixed(2);
                  let selectedFeature = metadata.fields.find(field => field.id === feature);
                  return (
                    <div key={index}>
                      <div style={styles.bold}>{feature}</div>
                      <p>{selectedFeature.description}</p>
                      <p>Possible Values:
                        <br />
                        {/* The unary plus operator converts the operand to a number and truncates any trailing zeroes.  */}
                        min: {+min}, max: {+max}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedCategoricalFeatures.length > 0 && (
              <div style={styles.modelCardContent}>
                {selectedCategoricalFeatures.map ((feature, index) => {
                  let selectedFeature = metadata.fields.find(field => field.id === feature);
                  return (
                    <div key={index}>
                      <div style={styles.bold}>{feature}</div>
                      <p>{selectedFeature.description}</p>
                      <p>Possible Values:{" "}
                        {uniqueOptionsByColumn[feature].join(", ")}
                      </p>
                    </div>
                  );
                })}
              </div>
           )}
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
