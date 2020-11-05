/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import {
  setShowPredict,
  setPercentDataToReserve,
  readyToTrain,
  validationMessages
} from "../redux";
import { TRAINING_DATA_PERCENTS, styles } from "../constants";

class TrainModel extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    readyToTrain: PropTypes.bool,
    validationMessages: PropTypes.array,
    setShowPredict: PropTypes.func.isRequired,
    selectedTrainer: PropTypes.string,
    percentDataToReserve: PropTypes.number,
    setPercentDataToReserve: PropTypes.func,
    modelSize: PropTypes.number
  };

  handleChange = event => {
    this.props.setPercentDataToReserve(parseInt(event.target.value));
    this.props.setShowPredict(false);
  };

  onClickTrainModel = () => {
    train.init();
    train.onClickTrain();
    this.props.setShowPredict(true);
  };

  render() {
    return (
      <div>
        <h2>Are you ready to train the model?</h2>
        {this.props.validationMessages.map((msg, index) => {
          return msg.readyToTrain ? (
            <p key={index} style={styles.ready}>
              {msg.successString}{" "}
            </p>
          ) : (
            <p key={index} style={styles.error}>
              {msg.errorString}{" "}
            </p>
          );
        })}
        <h3>How much of the data would you like to reserve for testing?</h3>
        <form>
          <label>
            Percent of dataset to reserve:
            <select
              value={this.props.percentDataToReserve}
              onChange={this.handleChange}
            >
              {TRAINING_DATA_PERCENTS.map((percent, index) => {
                return (
                  <option key={index} value={percent}>
                    {percent}
                  </option>
                );
              })}
            </select>
          </label>
        </form>
        {this.props.readyToTrain && (
          <div>
            <h2>Train the Model</h2>
            <p>
              The machine learning algorithm you selected,{" "}
              {availableTrainers[this.props.selectedTrainer]["name"]}, is going
              to look for patterns in these features:{" "}
              {this.props.selectedFeatures.join(", ")} that might help predict
              the values of the label: {this.props.labelColumn}.
            </p>
            <button type="button" onClick={this.onClickTrainModel}>
              Train model
            </button>
            {this.props.modelSize && (
              <p>The trained model is {this.props.modelSize} KB big.</p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedFeatures: state.selectedFeatures,
    labelColumn: state.labelColumn,
    selectedTrainer: state.selectedTrainer,
    readyToTrain: readyToTrain(state),
    validationMessages: validationMessages(state),
    percentDataToReserve: state.percentDataToReserve,
    modelSize: state.modelSize
  }),
  dispatch => ({
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    },
    setPercentDataToReserve(percentDataToReserve) {
      dispatch(setPercentDataToReserve(percentDataToReserve));
    }
  })
)(TrainModel);
