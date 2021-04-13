/* React component to handle displaying the model summary. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { saveMessages } from "../constants";
import Statement from "./Statement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

class ModelSummary extends Component {
  static propTypes = {
    trainedModelDetails: PropTypes.object,
    saveStatus: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 2000);
  }

  render() {
    const { trainedModelDetails, saveStatus } = this.props;

    let loadStatus = this.state.isLoading ? (
      <FontAwesomeIcon icon={faSpinner} />
    ) : (
      saveMessages[saveStatus]
    );

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
          {saveStatus === "success" && (
            <div style={{ position: "absolute", bottom: 0 }}>{loadStatus}</div>
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
