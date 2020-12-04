/* React component to handle selecting features and label columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setLabelColumn,
  setSelectedFeatures,
  setShowPredict,
  getSelectableFeatures,
  getShowSelectLabels,
  getSelectableLabels
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
    showSelectLabels: PropTypes.bool,
    selectableLabels: PropTypes.array
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
    const {
      showSelectLabels,
      selectableLabels,
      labelColumn,
      selectableFeatures,
      selectedFeatures
    } = this.props;

    return (
      <div id="select-features">
        <div style={styles.panel}>
          {showSelectLabels && (
            <form>
              <label>
                <div style={styles.largeText}>
                  Which column contains the labels for your dataset?
                </div>
                <p>
                  The label is the column you'd like to train the model to
                  predict.
                </p>
                <select value={labelColumn} onChange={this.handleChangeSelect}>
                  <option>{""}</option>
                  {selectableLabels.map((feature, index) => {
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
          {selectableFeatures.length > 0 && (
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
                  value={selectedFeatures}
                  onChange={this.handleChangeMultiSelect}
                >
                  {selectableFeatures.map((feature, index) => {
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
    showSelectLabels: getShowSelectLabels(state),
    selectableLabels: getSelectableLabels(state)
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
