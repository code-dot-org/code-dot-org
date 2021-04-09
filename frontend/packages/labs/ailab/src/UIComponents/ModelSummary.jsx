/* React component to handle displaying the model summary. */
// import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
// import { trainedModelDetails } from "../redux";
// import { styles } from "../constants";

class ModelSummary extends Component {


  render() {
    return (
      <p>hello</p>
    );
  }
}
export default connect(
  state => ({
    data: state.data,
  }),
)(ModelSummary);
