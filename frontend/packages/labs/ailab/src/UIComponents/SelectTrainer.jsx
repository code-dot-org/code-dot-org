/* React component to handle selecting which training algorithm will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setSelectedTrainer, getCompatibleTrainers, setKValue } from "../redux";
import { styles } from "../constants";

class SelectTrainer extends Component {
  static propTypes = {
    selectedTrainer: PropTypes.string,
    setSelectedTrainer: PropTypes.func,
    compatibleTrainers: PropTypes.object,
    setKValue: PropTypes.func, // set static propTypes for setKValue and kValue
    kValue: PropTypes.number
  };

  handleChangeSelect = event => {
    this.props.setSelectedTrainer(event.target.value);
  };

  /* add event handler -> handleChangeInput Function */
  handleChangeInput = event => {
    console.log("Console log for kValue:", event.target.value);
    this.props.setKValue(parseInt(event.target.value));
  }

  render() {
    const { compatibleTrainers, selectedTrainer } = this.props;
    return (
      <div id="select-trainer" style={styles.panel}>
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
          {
            // conditional rendering for selected classification and input for k value 
            
            (this.props.selectedTrainer === 'knnClassify' ||
            this.props.selectedTrainer === 'knnRegress') && (
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
    selectedTrainer: state.selectedTrainer,
    compatibleTrainers: getCompatibleTrainers(state),
    kValue: state.kValue
  }),
  dispatch => ({
    setSelectedTrainer(selectedTrainer) {
      dispatch(setSelectedTrainer(selectedTrainer));
    },
    setKValue(kValue) {
      dispatch(setKValue(kValue));
    }
  })
)(SelectTrainer);
