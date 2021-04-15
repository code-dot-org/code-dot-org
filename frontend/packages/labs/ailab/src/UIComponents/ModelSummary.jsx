/* React component to handle displaying the model summary. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import Statement from "./Statement";
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
        <Statement />
        <div style={styles.modelCardContainer}>
          <h3 style={styles.bold}>{trainedModelDetails.name}</h3>
          <span style={styles.bold}>Id: </span>
          <div>Summary</div>
          <p>
            Predict {metadata.labelColumn} based on{" "}
            {selectedFeatures.length > 0 && (
              <span>
                {selectedFeatures.join(", ")} with {summaryStat.stat}% accuracy.
              </span>
            )}
          </p>
          {console.log(metadata)}
          {console.log(summaryStat)}
          <div>About the Data</div>
          <p>{metadata.card.description}</p>
          <div>Intended Uses</div>
          <p>{trainedModelDetails.potentialUses} </p>
          <div>Warnings</div>
          <p>{trainedModelDetails.potentialMisuses}</p>
          <div>Label</div>
          <p>{labelColumn}</p>
          <div>Features</div>
          <p>{selectedFeatures.join(", ")}</p>
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
