/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import {
  setShowPredict,
  setPercentDataToReserve,
  getAccuracy,
  getConvertedLabels,
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
    accuracy: PropTypes.string,
    accuracyCheckLabels: PropTypes.array,
    accuracyCheckPredictedLabels: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      showAccuracy: false
    };
  }

  handleChange = event => {
    this.props.setPercentDataToReserve(parseInt(event.target.value));
    this.setState({
      showAccuracy: false
    });
  };

  onClickTrainModel = () => {
    train.init();
    train.onClickTrain();
    this.props.setShowPredict(true);
    this.setState({
      showAccuracy: true
    });
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
            {this.state.showAccuracy && (
              <div>
                <p>
                  {this.props.percentDataToReserve}% of the training data was
                  reserved to test the accuracy of the newly trained model.
                </p>
                {this.props.percentDataToReserve > 0 && (
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Expected</th>
                          <th>Predicted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.accuracyCheckLabels.map((label, index) => {
                          return (
                            <tr key={index}>
                              <td>{label}</td>
                              <td>
                                {this.props.accuracyCheckPredictedLabels[index]}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div>
                      <h3>The calculated accuracy of this model is:</h3>
                      {this.props.accuracy}%
                    </div>
                  </div>
                )}
              </div>
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
    accuracy: getAccuracy(state),
    accuracyCheckLabels: getConvertedLabels(state, state.accuracyCheckLabels),
    accuracyCheckPredictedLabels: getConvertedLabels(
      state,
      state.accuracyCheckPredictedLabels
    ),
    readyToTrain: readyToTrain(state),
    validationMessages: validationMessages(state),
    percentDataToReserve: state.percentDataToReserve
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
