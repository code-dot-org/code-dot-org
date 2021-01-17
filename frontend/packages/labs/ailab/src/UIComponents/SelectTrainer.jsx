/* React component to handle selecting which training algorithm will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getShowChooseReserve,
  setPercentDataToReserve,
  setSelectedTrainer,
  getCompatibleTrainers,
  setKValue
} from "../redux";
import { styles, TRAINING_DATA_PERCENTS } from "../constants";

class SelectTrainer extends Component {
  static propTypes = {
    showChooseReserve: PropTypes.bool,
    setPercentDataToReserve: PropTypes.func,
    selectedTrainer: PropTypes.string,
    setSelectedTrainer: PropTypes.func,
    compatibleTrainers: PropTypes.object,
    setKValue: PropTypes.func,
    kValue: PropTypes.number
  };

  handleChange = event => {
    this.props.setPercentDataToReserve(parseInt(event.target.value));
  };

  handleChangeSelect = event => {
    this.props.setSelectedTrainer(event.target.value);
  };

  /* add event handler -> handleChangeInput Function */
  handleChangeInput = event => {
    this.props.setKValue(parseInt(event.target.value));
  };

  render() {
    const {
      showChooseReserve,
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
                <select
                  value={percentDataToReserve}
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

        <div style={styles.largeText}>Pick an Algorithm</div>
        <form>
          <label>
            <p>Which Machine Learning Algorithm would you like to use?</p>
            <select
              value={this.props.selectedTrainer}
              onChange={this.handleChangeSelect}
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
                  onChange={this.handleChangeInput}
                  type="text"
                />
              </label>
            </div>
          )}
        </form>
      </div>
    );
  }
}

export default connect(
  state => ({
    showChooseReserve: getShowChooseReserve(state),
    percentDataToReserve: state.percentDataToReserve,

    selectedTrainer: state.selectedTrainer,
    compatibleTrainers: getCompatibleTrainers(state),
    kValue: state.kValue
  }),
  dispatch => ({
    setPercentDataToReserve(percentDataToReserve) {
      dispatch(setPercentDataToReserve(percentDataToReserve));
    },
    setSelectedTrainer(selectedTrainer) {
      dispatch(setSelectedTrainer(selectedTrainer));
    },
    setKValue(kValue) {
      dispatch(setKValue(kValue));
    }
  })
)(SelectTrainer);
