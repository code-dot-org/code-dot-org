/* React component to handle selecting columns as features. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { addSelectedFeature } from "../redux";
import I18n from "../i18n";


class AddFeatureButton extends Component {
  static propTypes = {
    column: PropTypes.string,
    addSelectedFeature: PropTypes.func.isRequired
  };

  addFeature = (event, column) => {
    this.props.addSelectedFeature(column);
    event.preventDefault();
  };

  render() {
    const { column } = this.props;

    return (
      <button
        id="uitest-add-feature-button"
        type="button"
        onClick={event => this.addFeature(event, column)}
        style={styles.selectFeaturesButton}
      >
        {I18n.t("addFeatureButton")}
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
