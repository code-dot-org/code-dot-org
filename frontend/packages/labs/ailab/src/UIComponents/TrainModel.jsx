/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import { setShowPredict, getAccuracy } from "../redux";

class TrainModel extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
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
    return (
      <div>
        {this.props.selectedFeatures.length > 0 &&
          this.props.labelColumn &&
          this.props.selectedTrainer && (
            <div>
              <h2>Train the Model</h2>
              <p>
                The machine learning algorithm you selected,{" "}
                {availableTrainers[this.props.selectedTrainer]["name"]}, is
                going to look for patterns in these features:{" "}
                {this.props.selectedFeatures.join(", ")} that might help predict
                the values of the label: {this.props.labelColumn}.
              </p>
              <button type="button" onClick={this.onClickTrainModel}>
                Train model
              </button>
              {this.state.showAccuracy && (
                <div>
                  <p>
                    10% of the training data was reserved to test the accuracy
                    of the newly trained model.
                  </p>
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
    accuracyCheckPredictedLabels: state.accuracyCheckPredictedLabels
  }),
  dispatch => ({
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    }
  })
)(TrainModel);
