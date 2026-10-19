import {Typography} from '@mui/material';
import React, {type ReactNode, useId, useMemo} from 'react';

import {dataColumnsFor} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {useDatasetValueAt, useTableView} from '../useTableView';

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
}: RowsPanelProps) => {
  const descriptionId = useId();
  const {project} = useProject();
  const data = useAppSelector(state => state.data);
  const columnTypes = useAppSelector(state => state.columnsByDataType);
  const columns = useMemo(
    () => [
      ...dataColumnsFor(data, project, showAllColumns),
      project.labelColumn || 'unknown',
    ],
    [data, project, showAllColumns]
  );
  const valueAt = useDatasetValueAt(data);
  const tableView = useTableView({
    rows: rowIndices,
    columns,
    columnTypes,
    valueAt,
  });

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Typography
          id={descriptionId}
          variant="body3"
          component="p"
          className={styles.text}
        >
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
        labelId={descriptionId}
        view={tableView}
        columns={columns}
        emphasizedColumn={emphasizedColumn}
        emptyText={emptyText}
        prediction={prediction}
      />
    </div>
  );
};

export default RowsPanel;
