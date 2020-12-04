/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import {
  setShowPredict,
  setPercentDataToReserve,
  readyToTrain,
  getShowChooseReserve
} from "../redux";
import { TRAINING_DATA_PERCENTS, styles } from "../constants";

class TrainModel extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    readyToTrain: PropTypes.bool,
    setShowPredict: PropTypes.func.isRequired,
    selectedTrainer: PropTypes.string,
    percentDataToReserve: PropTypes.number,
    setPercentDataToReserve: PropTypes.func,
    modelSize: PropTypes.number,
    showChooseReseve: PropTypes.bool
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
    const {showChooseReseve} = this.props;

    return (
      <div id="train-model" style={styles.panel}>
        {showChooseReseve && (
          <div>
            <div style={styles.largeText}>
              Are you ready to train the model?
            </div>

            <div>
              How much of the data would you like to reserve for testing?
            </div>
            <form>
              <label>
                Percent of dataset to reserve:{" "}
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
          </div>
        )}
        {this.props.readyToTrain && (
          <div>
            <p />
            <div style={styles.largeText}>Train the Model</div>
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
    percentDataToReserve: state.percentDataToReserve,
    modelSize: state.modelSize,
    showChooseReseve: getShowChooseReserve(state)
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
