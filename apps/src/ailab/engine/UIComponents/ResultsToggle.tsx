import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React from 'react';

import {ResultsGrades} from '../constants';
import type {DisplayTreeNodeCounts} from '../helpers/displayTreeTrace';

import styles from './resultsToggle.module.scss';

interface ResultsToggleProps {
  grade: string;
  onChange: (grade: string) => void;
  counts?: DisplayTreeNodeCounts;
}

const ResultsToggle = ({grade, onChange, counts}: ResultsToggleProps) => (
  <div role="group" aria-label="Show rows" className={styles.toggle}>
    <SegmentedButtons
      size="xs"
      className={styles.segments}
      selectedButtonValue={grade}
      onChange={onChange}
      buttons={[
        {
          value: ResultsGrades.CORRECT,
          label: counts ? `Correct (${counts.correct})` : 'Correct',
        },
        {
          value: ResultsGrades.INCORRECT,
          label: counts ? `Incorrect (${counts.incorrect})` : 'Incorrect',
        },
      ]}
    />
  </div>
);

export default ResultsToggle;
