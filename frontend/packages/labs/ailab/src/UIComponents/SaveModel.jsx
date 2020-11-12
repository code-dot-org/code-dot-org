/* React component to handle saving a trained model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";

class SaveModel extends Component {
  static propTypes = {
    saveTrainedModel: PropTypes.func,
    trainedModel: PropTypes.string
  };

  onClickSave = () => {
    alert("Don't get too excited, this doesn't do anything yet :)");
    console.log("trainedModel", this.props.trainedModel);
    this.props.saveTrainedModel();
  };

  render() {
    return (
      <div>
        <button type="button" onClick={this.onClickSave}>
          Save Trained Model
        </button>
      </div>
    );
  }
}

export default connect(state => ({
  trainedModel: state.trainedModel
}))(SaveModel);
