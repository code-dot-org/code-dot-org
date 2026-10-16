import {Typography} from '@mui/material';
import React, {type ReactNode} from 'react';

import ColumnsButton from './ColumnsButton';
import NodeRowsTable from './NodeRowsTable';

import styles from './rowsPanel.module.scss';

const rowCountText = (count: number) =>
  `${count} ${count === 1 ? 'Row' : 'Rows'}`;

export interface RowsPanelProps {
  description: ReactNode;
  rowIndices: number[];
  emphasizedColumn?: string;
  showAllColumns: boolean;
  onToggleColumns: () => void;
  emptyText?: string;
  resultsToggle?: ReactNode;
  prediction?: string | number;
}

const RowsPanel = ({
  description,
  rowIndices,
  emphasizedColumn,
  showAllColumns,
  onToggleColumns,
  emptyText = 'No rows reached this step',
  resultsToggle,
  prediction,
}: RowsPanelProps) => (
  <div className={styles.panel}>
    <div className={styles.header}>
      <Typography variant="body3" component="p" className={styles.text}>
        {description}
      </Typography>
      <div className={styles.actions}>
        {!resultsToggle && (
          <>
            <Typography variant="body3" component="span">
              <strong>{rowCountText(rowIndices.length)}</strong>
            </Typography>
            <span className={styles.divider} />
          </>
        )}
        <div className={styles.actionGroup}>
          {resultsToggle}
          <ColumnsButton
            showAllColumns={showAllColumns}
            onToggle={onToggleColumns}
          />
        </div>
      </div>
    </div>
    <NodeRowsTable
      rowIndices={rowIndices}
      emphasizedColumn={emphasizedColumn}
      showAllColumns={showAllColumns}
      emptyText={emptyText}
      prediction={prediction}
    />
  </div>
);

export default RowsPanel;
