import {Typography} from '@mui/material';
import React, {type ReactNode, useId, useMemo, useState} from 'react';

import {dataColumnsFor} from '../helpers/columnDetails';
import type {Grade} from '../helpers/displayTreeNodeContent';
import {rowCountText} from '../helpers/utils';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getData, getIdColumn} from '../selectors';
import {useDatasetTableView} from '../useDatasetTableView';
import {useGradedView} from '../useGradedView';

import NodeRowsTable from './NodeRowsTable';
import ResultsToggle from './ResultsToggle';
import TableActionRow from './TableActionRow';

import styles from './rowsPanel.module.scss';

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
  const data = useAppSelector(getData);
  const idColumn = useAppSelector(getIdColumn);
  const columns = useMemo(
    () => dataColumnsFor(data, project, showAllColumns, idColumn),
    [data, project, showAllColumns, idColumn]
  );
  const [grade, setGrade] = useState<Grade>('correct');
  const {view: tableView, counts} = useGradedView(
    useDatasetTableView(rowIndices, columns),
    rowsByGrade,
    grade
  );

  return (
    <div className={styles.panel}>
      <Typography
        id={descriptionId}
        variant="body3"
        component="p"
        className={styles.text}
      >
        {description}
      </Typography>
      <NodeRowsTable
        labelId={descriptionId}
        view={tableView}
        emphasizedColumn={emphasizedColumn}
        emptyText={emptyText}
        prediction={prediction}
        actionRow={
          <TableActionRow
            view={tableView}
            showAllColumns={showAllColumns}
            onToggleColumns={onToggleColumns}
          >
            {rowsByGrade ? (
              <ResultsToggle
                grade={grade}
                onChange={value => setGrade(value as Grade)}
                counts={counts}
              />
            ) : (
              <Typography
                variant="label3"
                component="span"
                className={styles.rowCount}
              >
                {rowCountText(tableView.rows.length, rowIndices.length)}
              </Typography>
            )}
          </TableActionRow>
        }
      />
    </div>
  );
};

export default RowsPanel;
