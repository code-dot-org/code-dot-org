import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Popover, Tooltip, Typography} from '@mui/material';
import React, {useRef, useState} from 'react';
import {flushSync} from 'react-dom';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {getDatasetId} from '../selectors';
import type {ColumnId, TableView} from '../types';

import {PREDICTION_COLUMN_NAME} from './RowsTableHeader';
import TableFilterColumnList from './TableFilterColumnList';
import TableFilterValueList from './TableFilterValueList';

import styles from './tableFilter.module.scss';

interface TableFilterProps {
  view: TableView;
}

const TableFilter = ({view}: TableFilterProps) => {
  const datasetId = useAppSelector(state => getDatasetId(state) || 'unknown');
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuColumn, setMenuColumn] = useState<ColumnId>();
  const [returnColumn, setReturnColumn] = useState<ColumnId>();
  const {filter} = view;
  const menuChecked =
    filter && filter.column === menuColumn ? filter.values : [];
  const canClear = menuColumn === undefined ? !!filter : menuChecked.length > 0;

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
    setReturnColumn(undefined);
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

  const backToColumns = (column: ColumnId) => {
    setMenuColumn(undefined);
    setReturnColumn(column);
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
        anchorEl={() => anchorRef.current!}
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
        {menuColumn === undefined ? (
          <TableFilterColumnList
            view={view}
            columnName={columnName}
            focusColumn={returnColumn}
            onSelect={setMenuColumn}
          />
        ) : (
          <TableFilterValueList
            view={view}
            column={menuColumn}
            name={columnName(menuColumn)}
            checked={menuChecked}
            onBack={() => backToColumns(menuColumn)}
          />
        )}
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
