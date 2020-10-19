/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import { setShowPredict } from "../redux";

class TrainModel extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    setShowPredict: PropTypes.func.isRequired,
    selectedTrainer: PropTypes.string
  };

  onClickTrainModel = () => {
    train.init();
    train.onClickTrain();
    this.props.setShowPredict(true);
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
    selectedTrainer: state.selectedTrainer
  }),
  dispatch => ({
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    }
  })
)(TrainModel);
