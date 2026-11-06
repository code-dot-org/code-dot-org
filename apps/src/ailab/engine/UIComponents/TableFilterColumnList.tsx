import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import type {ColumnId, TableView} from '../types';

import styles from './tableFilter.module.scss';

const categoryCount = (count: number) =>
  `${count} ${count === 1 ? 'category' : 'categories'}`;

interface TableFilterColumnListProps {
  view: TableView;
  columnName: (column: ColumnId) => string;
  focusColumn?: ColumnId;
  onSelect: (column: ColumnId) => void;
}

const TableFilterColumnList = ({
  view,
  columnName,
  focusColumn,
  onSelect,
}: TableFilterColumnListProps) => {
  const focusRef = useRef<HTMLButtonElement>(null);
  const {filter} = view;

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  return (
    <>
      <div className={styles.menuHeader}>
        <Typography variant="overline3" className={styles.menuTitle}>
          Filter by column
        </Typography>
      </div>
      <ul className={styles.list}>
        {view.shownFilterableColumns.map(column => {
          const isFiltered = filter?.column === column;
          return (
            <li key={String(column)}>
              <button
                ref={column === focusColumn ? focusRef : undefined}
                type="button"
                className={classNames(styles.columnItem, {
                  [styles.filtered]: isFiltered,
                })}
                onClick={() => onSelect(column)}
              >
                <Typography component="span" variant="label3">
                  {columnName(column)}
                </Typography>{' '}
                <Typography
                  component="span"
                  variant="body4"
                  className={styles.columnMeta}
                >
                  {isFiltered
                    ? `${filter.values.length} selected`
                    : categoryCount(view.filterOptions(column).length)}
                  <FontAwesomeV6Icon
                    iconName="chevron-right"
                    iconStyle="solid"
                    aria-hidden="true"
                  />
                </Typography>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default TableFilterColumnList;
