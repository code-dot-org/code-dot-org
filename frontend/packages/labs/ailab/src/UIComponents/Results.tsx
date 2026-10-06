import {TEST_PANEL_WIDTH} from '../constants';
import {useAppSelector} from '../hooks';
import {getDisplayTree} from '../selectors/visualizationSelectors';

import DecisionTree from './DecisionTree';
import ResultsBar from './ResultsBar';
import ResultsDetails from './ResultsDetails';
import TestPanel from './TestPanel';

import styles from './results.module.scss';

const Results = () => {
  const showResultsDetails = useAppSelector(state => state.showResultsDetails);
  const hasTree = useAppSelector(state => !!getDisplayTree(state));

  return (
    <div className={styles.container}>
      {showResultsDetails && <ResultsDetails />}

      <div id="results" className={styles.results}>
        <ResultsBar />
        {hasTree ? (
          <DecisionTree overlay={<TestPanel />} />
        ) : (
          <div className={styles.emptyCanvas}>
            <div className={styles.overlay} style={{width: TEST_PANEL_WIDTH}}>
              <TestPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
