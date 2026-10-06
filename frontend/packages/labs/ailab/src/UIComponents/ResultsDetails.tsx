import {getPercentCorrect, getResultsByGrade} from '../helpers/accuracy';
import {deepEqual, useAppSelector} from '../hooks';

import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';

import styles from './resultsDetails.module.scss';

const ResultsDetails = () => {
  const percentCorrect = useAppSelector(getPercentCorrect);
  const results = useAppSelector(
    state => getResultsByGrade(state, state.resultsTab),
    deepEqual,
  );

  return (
    <div className={styles.details}>
      {!isNaN(Number(percentCorrect)) && <ResultsToggle />}
      <ResultsTable results={results} />
    </div>
  );
};

export default ResultsDetails;
