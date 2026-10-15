import {IconButton, Tooltip, Typography} from '@mui/material';
import type {ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

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
}

const RowsPanel = ({
  description,
  rowIndices,
  emphasizedColumn,
  showAllColumns,
  onToggleColumns,
  emptyText = 'No rows reached this step',
  resultsToggle,
}: RowsPanelProps) => {
  const columnsLabel = showAllColumns
    ? 'Show only features and label'
    : 'Show all columns';

  return (
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
            <Tooltip title={columnsLabel}>
              <IconButton
                aria-label={columnsLabel}
                onClick={onToggleColumns}
                size="extraSmall"
                color="tertiary"
                variant="outlined"
              >
                <FontAwesomeV6Icon
                  iconName="arrows-left-right-to-line"
                  aria-hidden="true"
                />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      <NodeRowsTable
        rowIndices={rowIndices}
        emphasizedColumn={emphasizedColumn}
        showAllColumns={showAllColumns}
        emptyText={emptyText}
      />
    </div>
  );
};

export default RowsPanel;
