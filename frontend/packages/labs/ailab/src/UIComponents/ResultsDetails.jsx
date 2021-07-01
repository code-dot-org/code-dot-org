/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setShowResultsDetails } from "../redux";
import {
  getPercentCorrect,
  getCorrectResults,
  getIncorrectResults
} from "../helpers/accuracy";
import { ResultsGrades, styles } from "../constants";
import ResultsToggle from "./ResultsToggle";
import ResultsTable from "./ResultsTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

class ResultsDetails extends Component {
  static propTypes = {
    resultsTab: PropTypes.string,
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    percentCorrect: PropTypes.string,
    setShowResultsDetails: PropTypes.func,
    correctResults: PropTypes.object,
    incorrectResults: PropTypes.object,
  };

  onClose = () => {
    this.props.setShowResultsDetails(false);
  };

  render() {
    const results =
      this.props.resultsTab === ResultsGrades.CORRECT
        ? this.props.correctResults
        : this.props.incorrectResults;

    return (
      <div style={styles.panelPopupContainer}>
        <div id="results-details" style={styles.panelPopup}>
          <div onClick={this.onClose} style={styles.popupClose}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
          {!isNaN(this.props.percentCorrect) && <ResultsToggle />}
          <ResultsTable results={results} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    resultsTab: state.resultsTab,
    selectedFeatures: state.selectedFeatures,
    labelColumn: state.labelColumn,
    percentCorrect: getPercentCorrect(state),
    correctResults: getCorrectResults(state),
    incorrectResults: getIncorrectResults(state)
  }),
  dispatch => ({
    setShowResultsDetails(show) {
      dispatch(setShowResultsDetails(show));
    }
  })
)(ResultsDetails);
