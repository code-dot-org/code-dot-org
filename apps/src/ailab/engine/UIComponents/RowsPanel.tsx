import {Typography} from '@mui/material';
import React, {type ReactNode, useId, useMemo, useState} from 'react';

import {dataColumnsFor} from '../helpers/columnDetails';
import type {Grade} from '../helpers/displayTreeNodeContent';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {useDatasetTableView, viewForGrade} from '../useTableView';

import ColumnsButton from './ColumnsButton';
import NodeRowsTable from './NodeRowsTable';
import ResultsToggle from './ResultsToggle';
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
  rowsByGrade?: Record<Grade, number[]>;
  prediction?: string | number;
}

const RowsPanel = ({
  description,
  rowIndices,
  emphasizedColumn,
  showAllColumns,
  onToggleColumns,
  emptyText = 'No rows reached this step',
  rowsByGrade,
  prediction,
}: RowsPanelProps) => {
  const descriptionId = useId();
  const {project} = useProject();
  const data = useAppSelector(state => state.data);
  const columns = useMemo(
    () => dataColumnsFor(data, project, showAllColumns),
    [data, project, showAllColumns]
  );
  const tableView = useDatasetTableView(rowIndices, columns);
  const [grade, setGrade] = useState<Grade>('correct');
  const graded = rowsByGrade && viewForGrade(tableView, rowsByGrade, grade);

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
          {!graded && (
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
            {graded && (
              <ResultsToggle
                grade={grade}
                onChange={value => setGrade(value as Grade)}
                counts={graded.counts}
              />
            )}
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
        view={graded ? graded.view : tableView}
        emphasizedColumn={emphasizedColumn}
        emptyText={emptyText}
        prediction={prediction}
      />
    </div>
  );
};

export default RowsPanel;
