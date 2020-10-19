/* React component to handle selecting which training algorithm will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setSelectedTrainer } from "../redux";
import { availableTrainers } from "../train.js";

class SelectTrainer extends Component {
  static propTypes = {
    selectedTrainer: PropTypes.string,
    setSelectedTrainer: PropTypes.func
  };

  handleChangeSelect = event => {
    this.props.setSelectedTrainer(event.target.value);
  };

  render() {
    return (
      <div>
        <h2>Pick an Algorithm</h2>
        <form>
          <label>
            <p>Which Machine Learning Algorithm would you like to use?</p>
            <select
              value={this.props.selectedTrainer}
              onChange={this.handleChangeSelect}
            >
              <option>{""}</option>
              {Object.keys(availableTrainers).map((trainerKey, index) => {
                return (
                  <option key={index} value={trainerKey}>
                    {availableTrainers[trainerKey]["name"]}
                  </option>
                );
              })}
            </select>
            {this.props.selectedTrainer && (
              <p>
                {" "}
                {availableTrainers[this.props.selectedTrainer]["description"]}
              </p>
            )}
          </label>
        </form>
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedTrainer: state.selectedTrainer
  }),
  dispatch => ({
    setSelectedTrainer(selectedTrainer) {
      dispatch(setSelectedTrainer(selectedTrainer));
    }
  })
)(SelectTrainer);
