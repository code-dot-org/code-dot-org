/* React component to handle displaying accuracy results. */
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useCallback} from 'react';

import {ResultsGrades, styles} from '../constants';
import {
  getPercentCorrect,
  getCorrectResults,
  getIncorrectResults,
} from '../helpers/accuracy';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setShowResultsDetails} from '../redux';

import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';

const ResultsDetails = () => {
  const dispatch = useAppDispatch();
  const resultsTab = useAppSelector(state => state.resultsTab);
  const percentCorrect = useAppSelector(getPercentCorrect);
  const correctResults = useAppSelector(getCorrectResults);
  const incorrectResults = useAppSelector(getIncorrectResults);

  const onClose = useCallback(() => {
    dispatch(setShowResultsDetails(false));
  }, [dispatch]);

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

export default ResultsDetails;
