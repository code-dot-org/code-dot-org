/* React component to handle displaying the model summary. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { saveMessages, styles } from "../constants";
import { getSummaryStat } from "../redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

class ModelSummary extends Component {
  static propTypes = {
    trainedModelDetails: PropTypes.object,
    saveStatus: PropTypes.string,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    metadata: PropTypes.object,
    summaryStat: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  // Add a timer to simulate loading when saving a model.
  componentDidMount() {
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 2000);
  }

  render() {
    const {
      trainedModelDetails,
      saveStatus,
      labelColumn,
      selectedFeatures,
      metadata,
      summaryStat
    } = this.props;

    let loadStatus = this.state.isLoading ? (
      <FontAwesomeIcon icon={faSpinner} />
    ) : (
      saveMessages[saveStatus]
    );

    return (
      <div style={styles.panel}>
        <div style={styles.modelCardContainer}>
          <h3 style={styles.modelCardHeader}>{trainedModelDetails.name}</h3>
          <h5 style={styles.modelCardContent}>Id: </h5>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Summary</h5>
            <p style={styles.modelCardContent}>
              Predict {metadata.labelColumn} based on{" "}
              {selectedFeatures.length > 0 && (
                <span>
                  {selectedFeatures.join(", ")} with {summaryStat.stat}%
                  accuracy.
                </span>
              )}
            </p>
          </div>
          {console.log(metadata)}
          {console.log(summaryStat)}
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>About the Data </h5>
            <p style={styles.modelCardContent}>{metadata.card.description}</p>
          </div>
          <div style={styles.modelCardSubpanel}>
            <h5 style={styles.modelCardHeading}>Intended Uses</h5>
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
          <div>
            {saveStatus === "success" && (
              <div style={{ position: "absolute", bottom: 0 }}>
                {loadStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  trainedModelDetails: state.trainedModelDetails,
  saveStatus: state.saveStatus,
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
  metadata: state.metadata,
  summaryStat: getSummaryStat(state)
}))(ModelSummary);
