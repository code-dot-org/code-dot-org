/* React component to handle selecting columns as features. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { addSelectedFeature } from "../redux";


class AddFeatureButton extends Component {
  static propTypes = {
    column: PropTypes.string,
    addSelectedFeature: PropTypes.func.isRequired
  };

  addFeature = e => {
    this.props.addSelectedFeature(this.props.column);
    e.preventDefault();
  };

  render() {
    const { column } = this.props;

    return (
      <button
        type="button"
        onClick={e => this.addFeature(e, column)}
        style={styles.selectFeaturesButton}
      >
        Add feature
      </button>
    )
  }

}

export default connect(
  state => ({}),
  dispatch => ({
    addSelectedFeature(column) {
      dispatch(addSelectedFeature(column));
    }
  })
)(AddFeatureButton);
