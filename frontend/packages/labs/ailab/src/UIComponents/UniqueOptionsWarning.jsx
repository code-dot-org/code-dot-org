/* React component to handle showing warning for excessive unique options. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles, UNIQUE_OPTIONS_MAX } from "../constants";
import {
  hasTooManyUniqueOptions
} from "../selectors/currentColumnSelectors";

class UniqueOptionsWarning extends Component {
  static propTypes = {
    showWarning: PropTypes.bool
  };

  render() {
    const { showWarning } = this.props;

    if (!showWarning) {
      return null;
    }

    return (
      <div>
        <span style={styles.bold}>Note:</span>
        &nbsp; Categorical columns with more than {
          UNIQUE_OPTIONS_MAX
        }{" "}
        unique values can not be selected as the label or a feature.
      </div>
    );
  }
}

export default connect(
  state => ({
    showWarning: hasTooManyUniqueOptions(state)
  })
)(UniqueOptionsWarning);
