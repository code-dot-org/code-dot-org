/* React component to handle displaying accuracy results. */
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useCallback} from 'react';

import {ResultsGrades} from '../constants';
import {
  getPercentCorrect,
  getCorrectResults,
  getIncorrectResults,
} from '../helpers/accuracy';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setShowResultsDetails} from '../redux';

import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';

import styles from './resultsDetails.module.scss';

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
    <div className={styles.popupContainer}>
      <div id="results-details" className={styles.popup}>
        <div
          onClick={onClose}
          onKeyDown={onClose}
          className={styles.close}
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
