/* React component to handle displaying the model summary. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { saveMessages } from "../constants";
import Statement from "./Statement";

class ModelSummary extends Component {
  static propTypes = {
    trainedModelDetails: PropTypes.object,
    saveStatus: PropTypes.string
  };

  render() {
    const { trainedModelDetails } = this.props;

    return (
      <div>
        <Statement />
        <p>Model Name: {trainedModelDetails.name}</p>
        <p>How can this model be used? {trainedModelDetails.potentialUses}</p>
        <p>
          How can this model be potentially misused?
          {trainedModelDetails.potentialMisuses}
        </p>
        <div>
          {this.props.saveStatus && (
            <div style={{ position: "absolute", bottom: 0 }}>
              {saveMessages[this.props.saveStatus]}
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  trainedModelDetails: state.trainedModelDetails,
  saveStatus: state.saveStatus
}))(ModelSummary);
