/* React component to handle displaying the model summary. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { saveMessages } from "../constants";

class ModelSummary extends Component {
  static propTypes = {
    trainedModelDetails: PropTypes.object,
    saveStatus: PropTypes.string
  };

  render() {
    return (
      <div>
        <p>hello</p>
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
