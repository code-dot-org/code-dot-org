/* Which reserved rows the model predicted correctly, and which it missed. */
import {ResultsGrades} from '../constants';
import {
  getPercentCorrect,
  getCorrectResults,
  getIncorrectResults,
} from '../helpers/accuracy';
import {useAppSelector} from '../hooks';

import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';

import styles from './resultsDetails.module.scss';

const ResultsDetails = () => {
  const resultsTab = useAppSelector(state => state.resultsTab);
  const percentCorrect = useAppSelector(getPercentCorrect);
  const correctResults = useAppSelector(getCorrectResults);
  const incorrectResults = useAppSelector(getIncorrectResults);

  const results =
    resultsTab === ResultsGrades.CORRECT ? correctResults : incorrectResults;

  return (
    <div id="results-details" className={styles.details}>
      {!isNaN(Number(percentCorrect)) && <ResultsToggle />}
      <ResultsTable results={results} />
    </div>
  );
};

export default ResultsDetails;
