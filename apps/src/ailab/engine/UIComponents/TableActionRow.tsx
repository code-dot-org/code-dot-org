import React, {type ReactNode} from 'react';

import type {TableView} from '../types';

import ColumnsButton from './ColumnsButton';
import TableFilter from './TableFilter';

import styles from './tableActionRow.module.scss';

interface TableActionRowProps {
  view: TableView;
  showAllColumns: boolean;
  onToggleColumns: () => void;
  children?: ReactNode;
}

const TableActionRow = ({
  view,
  showAllColumns,
  onToggleColumns,
  children,
}: TableActionRowProps) => (
  <div className={styles.row}>
    <div className={styles.controls}>
      <TableFilter view={view} menuAlign="left" />
      <ColumnsButton
        showAllColumns={showAllColumns}
        onToggle={onToggleColumns}
      />
    </div>
    {children}
  </div>
);

export default TableActionRow;
