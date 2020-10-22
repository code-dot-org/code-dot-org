/* React component to handle selecting which training algorithm will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setSelectedTrainer, getCompatibleTrainers } from "../redux";

class SelectTrainer extends Component {
  static propTypes = {
    selectedTrainer: PropTypes.string,
    setSelectedTrainer: PropTypes.func,
    compatibleTrainers: PropTypes.object
  };

  handleChangeSelect = event => {
    this.props.setSelectedTrainer(event.target.value);
  };

  render() {
    const { compatibleTrainers, selectedTrainer } = this.props;
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
                <h3>{compatibleTrainers[selectedTrainer]["mlType"]}</h3>{" "}
                {compatibleTrainers[selectedTrainer]["description"]}
              </div>
            )}
          </label>
        </form>
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedTrainer: state.selectedTrainer,
    compatibleTrainers: getCompatibleTrainers(state)
  }),
  dispatch => ({
    setSelectedTrainer(selectedTrainer) {
      dispatch(setSelectedTrainer(selectedTrainer));
    }
  })
)(SelectTrainer);
