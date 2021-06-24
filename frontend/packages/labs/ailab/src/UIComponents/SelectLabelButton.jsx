/* React component to handle selecting columns as features. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { setLabelColumn } from "../redux";


class SelectLabelButton extends Component {
  static propTypes = {
    column: PropTypes.string,
    setLabelColumn: PropTypes.func.isRequired
  };

  setPredictColumn = (e, column) => {
    this.props.setLabelColumn(column);
    e.preventDefault();
  };


  render() {
    const { column } = this.props;

    return (
      <button
        type="button"
        onClick={e => this.setPredictColumn(e, column)}
        style={styles.selectLabelButton}
      >
        Select label
      </button>
    )
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    setLabelColumn(column) {
      dispatch(setLabelColumn(column));
    }
  })
)(AddFeatureButton);
