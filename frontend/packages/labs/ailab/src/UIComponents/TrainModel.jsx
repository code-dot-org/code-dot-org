/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import {
  setShowPredict,
  getAccuracy,
  readyToTrain,
  readyToTrainErrors
} from "../redux";

const styles = {
  error: {
    color: "red"
  },
  ready: {
    color: "green"
  }
};

class TrainModel extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    readyToTrain: PropTypes.bool,
    readyToTrainErrors: PropTypes.object,
    setShowPredict: PropTypes.func.isRequired,
    selectedTrainer: PropTypes.string,
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

  onClickTrainModel = () => {
    train.init();
    train.onClickTrain();
    this.props.setShowPredict(true);
    this.setState({
      showAccuracy: true
    });
  };

  render() {
    const { readyToTrainErrors } = this.props;
    return (
      <div>
        <h2>Are you ready to train the model?</h2>
        {readyToTrainErrors.noFeature && (
          <p style={styles.error}>
            Please select at least one feature to train on
          </p>
        )}
        {!readyToTrainErrors.noFeature && (
          <p style={styles.ready}>At least one feature is selected</p>
        )}
        {readyToTrainErrors.noLabel && (
          <p style={styles.error}>
            Please designate one column as the label column
          </p>
        )}
        {!readyToTrainErrors.noLabel && (
          <p style={styles.ready}>Label column has been selected</p>
        )}
        {readyToTrainErrors.noAlgorithm && (
          <p style={styles.error}>Please select a trainer to use</p>
        )}
        {!readyToTrainErrors.noAlgorithm && (
          <p style={styles.ready}> Trainer selected</p>
        )}
        {readyToTrainErrors.labelFeatureDupe && (
          <p style={styles.error}>Labels can not also be features</p>
        )}
        {readyToTrainErrors.badLabelAlgorithmCombo && (
          <p style={styles.error}>
            The label datatype is incompatible with the selected trainer.{" "}
            {readyToTrainErrors.labelDatatype} can not be used to train a{" "}
            {readyToTrainErrors.trainerMltype} model.
          </p>
        )}
        {!readyToTrainErrors.badLabelAlgorithmCombo &&
          this.props.selectedTrainer &&
          this.props.labelColumn && (
            <p style={styles.ready}>
              The label datatype is compatible with the selected trainer. A{" "}
              {readyToTrainErrors.labelDatatype} label can be used to train a{" "}
              {readyToTrainErrors.trainerMltype} model.
            </p>
          )}
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
                  10% of the training data was reserved to test the accuracy of
                  the newly trained model.
                </p>
                <div>
                  <table>
                    <tr>
                      <th>Expected</th>
                      <th>Predicted</th>
                    </tr>
                    {this.props.accuracyCheckLabels.map((label, index) => {
                      return (
                        <tr>
                          <td>{label}</td>
                          <td>
                            {this.props.accuracyCheckPredictedLabels[index]}
                          </td>
                        </tr>
                      );
                    })}
                  </table>
                </div>
                <h3>The calculated accuracy of this model is:</h3>
                {this.props.accuracy}%
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
    accuracyCheckLabels: state.accuracyCheckLabels,
    accuracyCheckPredictedLabels: state.accuracyCheckPredictedLabels,
    readyToTrain: readyToTrain(state),
    readyToTrainErrors: readyToTrainErrors(state)
  }),
  dispatch => ({
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    }
  })
)(TrainModel);
