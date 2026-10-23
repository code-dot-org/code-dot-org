import {Typography} from '@mui/material';
import React, {type ReactNode, useId, useMemo} from 'react';

import {dataColumnsFor} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getIdColumn} from '../selectors';
import {useDatasetTableView} from '../useTableView';

import ColumnsButton from './ColumnsButton';
import NodeRowsTable from './NodeRowsTable';
import TableFilter from './TableFilter';

import styles from './rowsPanel.module.scss';

const rowCountText = (shown: number, total: number) => {
  const totalText = `${total} ${total === 1 ? 'Row' : 'Rows'}`;
  return shown === total ? totalText : `${shown} of ${totalText}`;
};

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
  const idColumn = useAppSelector(getIdColumn);
  const columns = useMemo(
    () => dataColumnsFor(data, project, showAllColumns, idColumn),
    [data, project, showAllColumns, idColumn]
  );
  const tableView = useDatasetTableView(rowIndices, columns);

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
                <strong>
                  {rowCountText(tableView.rows.length, rowIndices.length)}
                </strong>
              </Typography>
              <span className={styles.divider} />
            </>
          )}
          <div className={styles.actionGroup}>
            {resultsToggle}
            <TableFilter view={tableView} />
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
        emphasizedColumn={emphasizedColumn}
        emptyText={emptyText}
        prediction={prediction}
      />
    </div>
  );
};

export default RowsPanel;
