import React, {useMemo, useState} from 'react';

import type {Grade} from '../helpers/displayTreeNodeContent';
import type {DisplayTreeNodeRows} from '../helpers/displayTreeTrace';

import ResultsToggle from './ResultsToggle';
import RowsPanel, {type RowsPanelProps} from './RowsPanel';

type AccuracyCheckRowsPanelProps = Pick<
  RowsPanelProps,
  'emphasizedColumn' | 'showAllColumns' | 'onToggleColumns' | 'prediction'
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
  const testedRows = useMemo(
    () => [...rows.correct, ...rows.incorrect].sort((a, b) => a - b),
    [rows]
  );

  if (!splitByGrade) {
    return (
      <RowsPanel
        description={description}
        rowIndices={testedRows}
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
