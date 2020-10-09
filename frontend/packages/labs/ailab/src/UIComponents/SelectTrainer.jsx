/* React component to handle selecting which training algorithm will be used. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setSelectedTrainer } from "../redux";

class SelectTrainer extends Component {
  static propTypes = {
    selectedTrainer: PropTypes.object
  };

  render() {
    return <div></div>;
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
