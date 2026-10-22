import Checkbox from '@code-dot-org/component-library/checkbox';
import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, IconButton, Popover, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useId, useRef, useState} from 'react';
import {flushSync} from 'react-dom';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import type {ColumnId, TableView} from '../types';

import {PREDICTION_COLUMN_NAME} from './RowsTableHeader';

import styles from './tableFilter.module.scss';

const categoryCount = (count: number) =>
  `${count} ${count === 1 ? 'category' : 'categories'}`;

interface TableFilterProps {
  view: TableView;
}

const TableFilter = ({view}: TableFilterProps) => {
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const valuesHeadingId = useId();
  const [open, setOpen] = useState(false);
  // Undefined lists the columns; a column lists its values.
  const [menuColumn, setMenuColumn] = useState<ColumnId>();
  const {filter} = view;
  const menuChecked =
    filter && filter.column === menuColumn ? filter.values : [];
  const canClear = menuColumn === undefined ? !!filter : menuChecked.length > 0;

  // A filter on a column since hidden keeps its tag, so it can be cleared.
  if (!filter && view.shownFilterableColumns.length === 0) {
    return null;
  }

  const columnName = (column: ColumnId) =>
    typeof column === 'string'
      ? getLocalizedColumnName(datasetId, column)
      : PREDICTION_COLUMN_NAME;

  const filterSummary =
    filter && `${columnName(filter.column)}: ${filter.values.join(', ')}`;

  const openMenu = (column?: ColumnId) => {
    setMenuColumn(column);
    setOpen(true);
  };

  // The trigger may have been swapped, and the focus trap must release first.
  const closeMenu = () => {
    flushSync(() => setOpen(false));
    triggerRef.current?.focus();
  };

  const clearFromTag = () => {
    flushSync(view.clearFilter);
    triggerRef.current?.focus();
  };

  const clearFromMenu = () => {
    doneRef.current?.focus();
    view.clearFilter();
  };

  const renderColumns = () => (
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
                type="button"
                className={classNames(styles.columnItem, {
                  [styles.filtered]: isFiltered,
                })}
                onClick={() => setMenuColumn(column)}
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

  const renderValues = (column: ColumnId) => {
    const options = view.filterOptions(column);
    const setChecked = (option: string, checked: boolean) =>
      view.filterBy(
        column,
        options.filter(value =>
          value === option ? checked : menuChecked.includes(value)
        )
      );

    return (
      <>
        <div className={styles.menuHeader}>
          <IconButton
            aria-label="Back to columns"
            variant="text"
            color="tertiary"
            size="extraSmall"
            onClick={() => setMenuColumn(undefined)}
          >
            <FontAwesomeV6Icon
              iconName="chevron-left"
              iconStyle="solid"
              aria-hidden="true"
            />
          </IconButton>
          <Typography
            id={valuesHeadingId}
            variant="overline3"
            className={styles.menuTitle}
          >
            {columnName(column)}
          </Typography>
        </div>
        <ul
          role="group"
          aria-labelledby={valuesHeadingId}
          className={styles.list}
        >
          {options.map(option => (
            <li key={option} className={styles.valueItem}>
              <Checkbox
                name={`Filter ${columnName(column)}`}
                value={option}
                size="xs"
                label={option}
                checked={menuChecked.includes(option)}
                onChange={event => setChecked(option, event.target.checked)}
              />
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div ref={anchorRef} className={styles.root}>
      {filter ? (
        <div className={styles.tag}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.tagButton}
            aria-label={`Filter by ${filterSummary}`}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => openMenu(filter.column)}
          >
            <FontAwesomeV6Icon
              iconName="bars-filter"
              iconStyle="solid"
              aria-hidden="true"
            />
            <Typography
              component="span"
              variant="label3"
              className={styles.tagText}
            >
              {columnName(filter.column)}:{' '}
              <span className={styles.tagValues}>
                {filter.values.join(', ')}
              </span>
            </Typography>
          </button>
          <Tooltip title="Clear filter" describeChild>
            <span className={styles.clear}>
              <CloseButton
                size="xs"
                aria-label="Clear filter"
                onClick={clearFromTag}
              />
            </span>
          </Tooltip>
        </div>
      ) : (
        <Button
          ref={triggerRef}
          variant="outlined"
          color="tertiary"
          size="extraSmall"
          startIcon={
            <FontAwesomeV6Icon
              iconName="bars-filter"
              iconStyle="solid"
              aria-hidden="true"
            />
          }
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => openMenu()}
        >
          Filter
        </Button>
      )}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={closeMenu}
        disableRestoreFocus
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': 'Filter rows',
            className: styles.panel,
          },
        }}
      >
        {menuColumn === undefined ? renderColumns() : renderValues(menuColumn)}
        <div className={styles.actions}>
          <Button
            variant="text"
            color="secondary"
            size="extraSmall"
            disabled={!canClear}
            onClick={clearFromMenu}
          >
            Clear filter
          </Button>
          <Button
            ref={doneRef}
            variant="contained"
            color="secondary"
            size="extraSmall"
            onClick={closeMenu}
          >
            {menuChecked.length ? `Done (${menuChecked.length})` : 'Done'}
          </Button>
        </div>
      </Popover>
    </div>
  );
};

export default TableFilter;
