/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getConvertedAccuracyCheckExamples,
  getConvertedLabels,
  getSummaryStat,
  setShowResultsDetails
} from "../redux";
import { styles } from "../constants";
import Statement from "./Statement";
import ResultsTable from "./ResultsTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

class ResultsDetails extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    percentDataToReserve: PropTypes.number,
    summaryStat: PropTypes.object,
    accuracyCheckExamples: PropTypes.array,
    accuracyCheckLabels: PropTypes.array,
    accuracyCheckPredictedLabels: PropTypes.array,
    setShowResultsDetails: PropTypes.func
  };

  onClose = () => {
    this.props.setShowResultsDetails(false);
  };

  render() {
    return (
      <div style={styles.panelPopupContainer}>
        <div id="results-details" style={styles.panelPopup}>
          <div onClick={this.onClose} style={styles.popupClose}>
            <FontAwesomeIcon icon={faTimes} />
          </div>

          <Statement />

          {!isNaN(this.props.summaryStat.stat) && (
            <div>
              {this.props.percentDataToReserve}% of the training data was
              reserved to test the accuracy of the newly trained model.
            </div>
          )}

          {!isNaN(this.props.summaryStat.stat) && <ResultsTable />}

          {isNaN(this.props.summaryStat.stat) && (
            <p>
              An accuracy score was not calculated because no training data was
              reserved for testing.
            </p>
          )}
          <div>
            {!isNaN(this.props.summaryStat.stat) && (
              <div>
                <div style={styles.mediumText}>Accuracy</div>
                <div style={styles.contents}>
                  {this.props.summaryStat.stat}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedFeatures: state.selectedFeatures,
    labelColumn: state.labelColumn,
    summaryStat: getSummaryStat(state),
    accuracyCheckExamples: getConvertedAccuracyCheckExamples(state),
    accuracyCheckLabels: getConvertedLabels(state, state.accuracyCheckLabels),
    accuracyCheckPredictedLabels: getConvertedLabels(
      state,
      state.accuracyCheckPredictedLabels
    ),
    percentDataToReserve: state.percentDataToReserve
  }),
  dispatch => ({
    setShowResultsDetails(show) {
      dispatch(setShowResultsDetails(show));
    }
  })
)(ResultsDetails);
