/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import { useCallback } from "react";
import { connect } from "react-redux";
import { setShowResultsDetails } from "../redux";
import {
  getPercentCorrect,
  getCorrectResults,
  getIncorrectResults
} from "../helpers/accuracy";
import { ResultsGrades, styles } from "../constants";
import { resultsPropType } from "./shapes";
import ResultsToggle from "./ResultsToggle";
import ResultsTable from "./ResultsTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function ResultsDetails({ resultsTab, selectedFeatures, labelColumn, percentCorrect, setShowResultsDetails, correctResults, incorrectResults }) {
  const onClose = useCallback(() => {
    setShowResultsDetails(false);
  }, [setShowResultsDetails]);

  const results =
    resultsTab === ResultsGrades.CORRECT
      ? correctResults
      : incorrectResults;

  return (
    <div style={styles.panelPopupContainer}>
      <div id="results-details" style={styles.panelPopup}>
        <div
          onClick={onClose}
          onKeyDown={onClose}
          style={styles.popupClose}
          role="button"
          tabIndex={0}
        >
          <FontAwesomeIcon icon={faTimes} />
        </div>
        {!isNaN(percentCorrect) && <ResultsToggle />}
        <ResultsTable results={results} />
      </div>
    </div>
  );
}

ResultsDetails.propTypes = {
  resultsTab: PropTypes.string,
  selectedFeatures: PropTypes.array,
  labelColumn: PropTypes.string,
  percentCorrect: PropTypes.string,
  setShowResultsDetails: PropTypes.func,
  correctResults: resultsPropType,
  incorrectResults: resultsPropType,
};

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
