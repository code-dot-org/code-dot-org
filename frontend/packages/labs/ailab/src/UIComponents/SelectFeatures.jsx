/* React component to handle selecting features and label columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setLabelColumn,
  setSelectedFeatures,
  setShowPredict,
  getSelectableFeatures,
  getSelectableLabels,
  validationMessages
} from "../redux";
import { styles } from "../constants";

class SelectFeatures extends Component {
  static propTypes = {
    features: PropTypes.array,
    labelColumn: PropTypes.string,
    setLabelColumn: PropTypes.func.isRequired,
    selectedFeatures: PropTypes.array,
    setSelectedFeatures: PropTypes.func.isRequired,
    setShowPredict: PropTypes.func.isRequired,
    selectableFeatures: PropTypes.array,
    selectableLabels: PropTypes.array,
    validationMessages: PropTypes.object,
    mode: PropTypes.object
  };

  handleChangeSelect = event => {
    this.props.setLabelColumn(event.target.value);
    this.props.setShowPredict(false);
  };

  handleChangeMultiSelect = event => {
    this.props.setSelectedFeatures(
      Array.from(event.target.selectedOptions, item => item.value)
    );
    this.props.setShowPredict(false);
  };

  render() {
    return (
      <div id="select-features">
        <div style={styles.panel}>
          {!this.props.mode.hideSelectLabel && this.props.selectableLabels.length > 0 && (
            <form>
              <label>
                <div style={styles.largeText}>
                  Which column contains the labels for your dataset?
                </div>
                <p>
                  The label is the column you'd like to train the model to
                  predict.
                </p>
                <select
                  value={this.props.labelColumn}
                  onChange={this.handleChangeSelect}
                >
                  <option>{""}</option>
                  {this.props.selectableLabels.map((feature, index) => {
                    return (
                      <option key={index} value={feature}>
                        {feature}
                      </option>
                    );
                  })}
                </select>
              </label>
            </form>
          )}
          {this.props.selectableFeatures.length > 0 && (
            <form>
              <p />
              <label>
                <div style={styles.largeText}>
                  Which features are you interested in training on?
                </div>
                <p>
                  Features are the attributes the model will use to make a
                  prediction.
                </p>
                <select
                  multiple={true}
                  value={this.props.selectedFeatures}
                  onChange={this.handleChangeMultiSelect}
                >
                  {this.props.selectableFeatures.map((feature, index) => {
                    return (
                      <option key={index} value={feature}>
                        {feature}
                      </option>
                    );
                  })}
                </select>
              </label>
            </form>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    selectableFeatures: getSelectableFeatures(state),
    selectableLabels: getSelectableLabels(state),
    validationMessages: validationMessages(state),
    mode: state.mode
  }),
  dispatch => ({
    setSelectedFeatures(selectedFeatures) {
      dispatch(setSelectedFeatures(selectedFeatures));
    },
    setLabelColumn(labelColumn) {
      dispatch(setLabelColumn(labelColumn));
    },
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    }
  })
)(SelectFeatures);
