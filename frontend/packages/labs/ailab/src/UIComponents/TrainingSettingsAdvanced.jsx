/* React component to handle selecting which training algorithm will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getShowChooseReserve,
  setPercentDataToReserve,
  setReserveLocation,
  setKValue
} from "../redux";
import { styles } from "../constants";

class TrainingSettingsAdvanced extends Component {
  static propTypes = {
    showChooseReserve: PropTypes.bool,
    percentDataToReserve: PropTypes.number,
    setPercentDataToReserve: PropTypes.func,
    setReserveLocation: PropTypes.func,
    setKValue: PropTypes.func,
    kValue: PropTypes.number
  };

  handleChangePercentReserve = event => {
    this.props.setPercentDataToReserve(parseInt(event.target.value));
  };

  handleChangeReserveLocation = event => {
    this.props.setReserveLocation(event.target.value);
  };

  handleChangeKValue = event => {
    this.props.setKValue(parseInt(event.target.value));
  };

  render() {
    const {
      showChooseReserve,
      percentDataToReserve,
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
          <div>
            <label>
              <p>What would you like the value of K to be?</p>
              <input
                onChange={this.handleChangeKValue}
                type="text"
              />
            </label>
          </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    showChooseReserve: getShowChooseReserve(state),
    percentDataToReserve: state.percentDataToReserve,
    kValue: state.kValue
  }),
  dispatch => ({
    setPercentDataToReserve(percentDataToReserve) {
      dispatch(setPercentDataToReserve(percentDataToReserve));
    },
    setReserveLocation(reserveLocation) {
      dispatch(setReserveLocation(reserveLocation));
    },
    setKValue(kValue) {
      dispatch(setKValue(kValue));
    }
  })
)(TrainingSettingsAdvanced);
