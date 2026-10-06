/* Switches the scorecard between the rows the model got right and the rows it missed. */
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';

import {ResultsGrades} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setResultsTab} from '../redux';

import styles from './resultsToggle.module.scss';

const ResultsToggle = () => {
  const resultsTab = useAppSelector(state => state.resultsTab);
  const dispatch = useAppDispatch();

  return (
    <div role="group" aria-label="Show rows" className={styles.toggle}>
      <SegmentedButtons
        size="xs"
        className={styles.segments}
        selectedButtonValue={resultsTab}
        onChange={value => dispatch(setResultsTab(value))}
        buttons={[
          {value: ResultsGrades.CORRECT, label: 'Correct'},
          {value: ResultsGrades.INCORRECT, label: 'Incorrect'},
        ]}
      />
    </div>
  );
};

export default ResultsToggle;
