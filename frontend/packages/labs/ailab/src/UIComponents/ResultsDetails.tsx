/* React component to handle displaying accuracy results. */
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useCallback} from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {ResultsGrades, styles} from '../constants';
import {
  getPercentCorrect,
  getCorrectResults,
  getIncorrectResults,
} from '../helpers/accuracy';
import {setShowResultsDetails, RootState} from '../redux';
import {ResultsData} from '../types';

import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';

interface ResultsDetailsProps {
  resultsTab: string;
  selectedFeatures: string[];
  labelColumn: string | undefined;
  percentCorrect: string;
  setShowResultsDetails: (show: boolean) => void;
  correctResults: ResultsData;
  incorrectResults: ResultsData;
}

const ResultsDetails = ({
  resultsTab,
  selectedFeatures,
  labelColumn,
  percentCorrect,
  setShowResultsDetails,
  correctResults,
  incorrectResults,
}: ResultsDetailsProps) => {
  const onClose = useCallback(() => {
    setShowResultsDetails(false);
  }, [setShowResultsDetails]);

  const results =
    resultsTab === ResultsGrades.CORRECT ? correctResults : incorrectResults;

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
        {!isNaN(Number(percentCorrect)) && <ResultsToggle />}
        <ResultsTable results={results} />
      </div>
    </div>
  );
};

export default connect(
  (state: RootState) => ({
    resultsTab: state.resultsTab,
    selectedFeatures: state.selectedFeatures,
    labelColumn: state.labelColumn,
    percentCorrect: getPercentCorrect(state),
    correctResults: getCorrectResults(state),
    incorrectResults: getIncorrectResults(state),
  }),
  (dispatch: Dispatch) => ({
    setShowResultsDetails(show: boolean) {
      dispatch(setShowResultsDetails(show));
    },
  }),
)(ResultsDetails);
