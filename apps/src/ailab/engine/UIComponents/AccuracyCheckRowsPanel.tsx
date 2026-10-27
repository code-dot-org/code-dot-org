import React, {useMemo} from 'react';

import type {DisplayTreeNodeRows} from '../helpers/displayTreeTrace';

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
  const testedRows = useMemo(
    () => [...rows.correct, ...rows.incorrect].sort((a, b) => a - b),
    [rows]
  );

  return (
    <RowsPanel
      description={description}
      rowIndices={testedRows}
      rowsByGrade={splitByGrade ? rows : undefined}
      emptyText={splitByGrade ? 'No rows matched this filter' : undefined}
      {...columnProps}
    />
  );
};

export default AccuracyCheckRowsPanel;
