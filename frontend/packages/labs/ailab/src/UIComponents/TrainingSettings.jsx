/* React component to handle pre-training set up options. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import PercentReserveSlider from "./PercentReserveSlider";
import ColumnTypeSelector from "./ColumnTypeSelector";
import { connect } from "react-redux";
import { styles } from "../constants";
import { getShowChooseReserve } from "../redux";

class TrainingSettings extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    hideSpecifyColumns: PropTypes.bool,
    showChooseReserve: PropTypes.bool
  };

  render() {
    return (
      <div id="select-trainer" style={styles.panel}>
        <div>
          <div style={styles.largeText}>Are you ready to train A.I. Bot?</div>
          <div style={styles.mediumText}>
            A.I. Bot will predict {this.props.labelColumn} based on{" "}
            {this.props.selectedFeatures.join(", ")}.
          </div>
          {this.showChooseReserve && <PercentReserveSlider />}
          {!this.props.hideSpecifyColumns && <ColumnTypeSelector />}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
  hideSpecifyColumns: state.mode && state.mode.hideSpecifyColumns,
  showChooseReserve: getShowChooseReserve(state)
}))(TrainingSettings);
