import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React from 'react';

import {ResultsGrades} from '../constants';

import styles from './resultsToggle.module.scss';

interface ResultsToggleProps {
  grade: string;
  onChange: (grade: string) => void;
}

const ResultsToggle = ({grade, onChange}: ResultsToggleProps) => (
  <div role="group" aria-label="Show rows" className={styles.toggle}>
    <SegmentedButtons
      size="xs"
      className={styles.segments}
      selectedButtonValue={grade}
      onChange={onChange}
      buttons={[
        {value: ResultsGrades.CORRECT, label: 'Correct'},
        {value: ResultsGrades.INCORRECT, label: 'Incorrect'},
      ]}
    />
  </div>
);

export default ResultsToggle;
