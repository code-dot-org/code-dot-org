import {useState} from 'react';

import type {Grade} from '../helpers/displayTreeNodeContent';
import type {DisplayTreeNodeRows} from '../helpers/displayTreeTrace';

import ResultsToggle from './ResultsToggle';
import RowsPanel, {type RowsPanelProps} from './RowsPanel';

type AccuracyCheckRowsPanelProps = Pick<
  RowsPanelProps,
  'emphasizedColumn' | 'showAllColumns' | 'onToggleColumns'
> & {
  rows: DisplayTreeNodeRows;
  splitByGrade: boolean;
};

const description = (
  <>
    These are the rows AI <strong>tested on</strong> that reached this step.
  </>
);

const AccuracyCheckRowsPanel = ({
  rows,
  splitByGrade,
  ...columnProps
}: AccuracyCheckRowsPanelProps) => {
  const [grade, setGrade] = useState<Grade>('correct');

  if (!splitByGrade) {
    return (
      <RowsPanel
        description={description}
        rowIndices={[...rows.correct, ...rows.incorrect].sort((a, b) => a - b)}
        {...columnProps}
      />
    );
  }

  return (
    <RowsPanel
      description={description}
      rowIndices={rows[grade]}
      emptyText="No rows matched this filter"
      resultsToggle={
        <ResultsToggle
          grade={grade}
          onChange={value => setGrade(value as Grade)}
          counts={{
            correct: rows.correct.length,
            incorrect: rows.incorrect.length,
          }}
        />
      }
      {...columnProps}
    />
  );
};

export default AccuracyCheckRowsPanel;
