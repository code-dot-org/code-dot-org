/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import { readyToTrain } from "../redux";
import { styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

class TrainModel extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    readyToTrain: PropTypes.bool,
    selectedTrainer: PropTypes.string,
    percentDataToReserve: PropTypes.number,
    modelSize: PropTypes.number
  };

  componentDidMount() {
    this.onClickTrainModel();
  }

  onClickTrainModel = () => {
    train.init();
    train.onClickTrain();
  };

  render() {
    return (
      <div id="train-model" style={styles.panel}>
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
            {/*<button type="button" onClick={this.onClickTrainModel}>
              Train model
            </button>*/}
            {!this.props.modelSize && (
              <FontAwesomeIcon icon={faSpinner} />
            )}
            {this.props.modelSize && (
              <p>The trained model is {this.props.modelSize} KB big.</p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  selectedFeatures: state.selectedFeatures,
  labelColumn: state.labelColumn,
  selectedTrainer: state.selectedTrainer,
  readyToTrain: readyToTrain(state),
  modelSize: state.modelSize
}))(TrainModel);
