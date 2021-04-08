/* React component to handle selecting which K value will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setKValue } from "../redux";

class SetKValue extends Component {
  static propTypes = {
    setKValue: PropTypes.func,
    kValue: PropTypes.number
  };

  handleChangeKValue = event => {
    this.props.setKValue(parseInt(event.target.value));
  };

  render() {
    const {kValue} = this.props;

    return (
      <div>
        <label>
          <p>What would you like the value of K to be?</p>
          <input
            onChange={this.handleChangeKValue}
            type="text"
            value={kValue}
          />
        </label>
      </div>
    );
  }
}

export default connect(
  state => ({
    kValue: state.kValue
  }),
  dispatch => ({
    setKValue(kValue) {
      dispatch(setKValue(kValue));
    }
  })
)(SetKValue);
