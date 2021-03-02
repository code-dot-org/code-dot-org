/* React component to handle selecting % of data to use for training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setPercentDataToReserve } from "../redux";

class PercentReserveSlider extends Component {
  static propTypes = {
    percentDataToReserve: PropTypes.number,
    setPercentDataToReserve: PropTypes.func,
  };

  handleChangePercentReserve = (event) => {
    this.props.setPercentDataToReserve(parseInt(event.target.value));
  };

  render() {
    const { percentDataToReserve } = this.props;

    return (
      <div>
        <div>How much of the data would you like to reserve for testing?</div>
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
    );
  }
}

export default connect(
  (state) => ({
    percentDataToReserve: state.percentDataToReserve
  }),
  (dispatch) => ({
    setPercentDataToReserve(percentDataToReserve) {
      dispatch(setPercentDataToReserve(percentDataToReserve));
    },
  })
)(PercentReserveSlider);
