/* React component to handle saving a trained model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setTrainedModelDetails, getTrainedModelDataToSave } from "../redux";

class SaveModel extends Component {
  static propTypes = {
    saveTrainedModel: PropTypes.func,
    trainedModel: PropTypes.object,
    setTrainedModelDetails: PropTypes.func,
    trainedModelDetails: PropTypes.object,
    dataToSave: PropTypes.object
  };

  handleChange = (event, field) => {
    const trainedModelDetails = this.props.trainedModelDetails;
    trainedModelDetails[field] = event.target.value;
    this.props.setTrainedModelDetails(trainedModelDetails);
  };

  onClickSave = () => {
    if (this.props.trainedModelDetails.name !== undefined) {
      this.props.saveTrainedModel(this.props.dataToSave);
    }
  };

  render() {
    return (
      <div>
        <br />
        <br />
        <label>
          Model name:
          <input
            type="text"
            onChange={event => this.handleChange(event, "name")}
          />
        </label>
        <label>
          Model description:
          <textarea
            onChange={event => this.handleChange(event, "description")}
          />
        </label>
        <button type="button" onClick={this.onClickSave}>
          Save Trained Model
        </button>
      </div>
    );
  }
}

export default connect(
  state => ({
    trainedModel: state.trainedModel,
    trainedModelDetails: state.trainedModelDetails,
    dataToSave: getTrainedModelDataToSave(state)
  }),
  dispatch => ({
    setTrainedModelDetails(trainedModelDetails) {
      dispatch(setTrainedModelDetails(trainedModelDetails));
    }
  })
)(SaveModel);
