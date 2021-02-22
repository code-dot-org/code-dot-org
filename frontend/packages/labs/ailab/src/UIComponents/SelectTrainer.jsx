/* React component to handle selecting which training algorithm will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getShowChooseReserve,
  getShowSelectTrainer,
  setPercentDataToReserve,
  setReserveLocation,
  setSelectedTrainer,
  getCompatibleTrainers,
  setKValue
} from "../redux";
import { styles } from "../constants";

class SelectTrainer extends Component {
  static propTypes = {
    showChooseReserve: PropTypes.bool,
    showSelectTrainer: PropTypes.bool,
    percentDataToReserve: PropTypes.number,
    setPercentDataToReserve: PropTypes.func,
    setReserveLocation: PropTypes.func,
    selectedTrainer: PropTypes.string,
    setSelectedTrainer: PropTypes.func,
    compatibleTrainers: PropTypes.object,
    setKValue: PropTypes.func,
    kValue: PropTypes.number
  };

  handleChangePercentReserve = event => {
    this.props.setPercentDataToReserve(parseInt(event.target.value));
  };

  handleChangeReserveLocation = event => {
    this.props.setReserveLocation(event.target.value);
  };

  handleChangeSelectTrainer = event => {
    this.props.setSelectedTrainer(event.target.value);
  };

  handleChangeKValue = event => {
    this.props.setKValue(parseInt(event.target.value));
  };

  render() {
    const {
      showChooseReserve,
      showSelectTrainer,
      percentDataToReserve,
      compatibleTrainers,
      selectedTrainer
    } = this.props;

    return (
      <div id="select-trainer" style={styles.panel}>
        {showChooseReserve && (
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
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={percentDataToReserve}
                  onChange={this.handleChangePercentReserve}
                />
              </label>
              <br />
              {percentDataToReserve}%
            </form>
          </div>
        )}
        {showSelectTrainer && (
          <div>
            <br />
            <br />
            <div style={styles.largeText}>Pick an Algorithm</div>
            <form>
              <label>
                <p>Which Machine Learning Algorithm would you like to use?</p>
                <select
                  value={this.props.selectedTrainer}
                  onChange={this.handleChangeSelectTrainer}
                >
                  <option>{""}</option>
                  {Object.keys(compatibleTrainers).map((trainerKey, index) => {
                    return (
                      <option key={index} value={trainerKey}>
                        {compatibleTrainers[trainerKey]["name"]}
                      </option>
                    );
                  })}
                </select>
                {this.props.selectedTrainer && (
                  <div>
                    <div style={styles.mediumText}>
                      {compatibleTrainers[selectedTrainer]["mlType"]}
                    </div>{" "}
                    {compatibleTrainers[selectedTrainer]["description"]}
                  </div>
                )}
              </label>
              {(this.props.selectedTrainer === "knnClassify" ||
                this.props.selectedTrainer === "knnRegress") && (
                <div>
                  <label>
                    <p>What would you like the value of K to be?</p>
                    <input
                      /* value of input is handled by default */
                      onChange={this.handleChangeKValue}
                      type="text"
                    />
                  </label>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    showChooseReserve: getShowChooseReserve(state),
    showSelectTrainer: getShowSelectTrainer(state),
    percentDataToReserve: state.percentDataToReserve,
    selectedTrainer: state.selectedTrainer,
    compatibleTrainers: getCompatibleTrainers(state),
    kValue: state.kValue
  }),
  dispatch => ({
    setPercentDataToReserve(percentDataToReserve) {
      dispatch(setPercentDataToReserve(percentDataToReserve));
    },
    setReserveLocation(reserveLocation) {
      dispatch(setReserveLocation(reserveLocation));
    },
    setSelectedTrainer(selectedTrainer) {
      dispatch(setSelectedTrainer(selectedTrainer));
    },
    setKValue(kValue) {
      dispatch(setKValue(kValue));
    }
  })
)(SelectTrainer);
