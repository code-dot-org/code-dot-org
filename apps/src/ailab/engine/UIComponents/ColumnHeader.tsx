import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {type ReactNode} from 'react';

import {nextSortDirection, type TableView} from '../useTableView';

import tableStyles from './dataTable.module.scss';

const SORT_ICONS = {
  text: {ascending: 'arrow-down-a-z', descending: 'arrow-up-a-z'},
  number: {ascending: 'arrow-down-1-9', descending: 'arrow-up-1-9'},
};

const SORT_ORDERS = {
  text: {ascending: 'A-Z', descending: 'Z-A'},
  number: {ascending: 'low to high', descending: 'high to low'},
};

interface ColumnHeaderProps {
  column: string;
  name: string;
  view?: TableView;
  // The selected column's dark header needs the sort button in its own color.
  selected?: boolean;
  className?: string;
  children: ReactNode;
}

const ColumnHeader = ({
  column,
  name,
  view,
  selected,
  className,
  children,
}: ColumnHeaderProps) => {
  if (!view) {
    return (
      <th scope="col" className={className}>
        {children}
      </th>
    );
  }

  const kind = view.isNumerical(column) ? 'number' : 'text';
  const sortDirection = view.sortDirection(column);
  const nextDirection = nextSortDirection(sortDirection);
  const sortLabel = nextDirection
    ? `Sort by ${name} ${SORT_ORDERS[kind][nextDirection]}`
    : 'Original order';

  return (
    <th
      scope="col"
      aria-sort={sortDirection}
      className={classNames(className, tableStyles.headerWithControls)}
    >
      {children}
      <span
        className={classNames(tableStyles.sortControl, {
          [tableStyles.sorted]: sortDirection,
        })}
      >
        <Tooltip
          title={
            <span className={tableStyles.sortTooltip}>
              {nextDirection && (
                <FontAwesomeV6Icon
                  iconName={SORT_ICONS[kind][nextDirection]}
                  iconStyle="solid"
                />
              )}
              {sortLabel}
            </span>
          }
        >
          <IconButton
            aria-label={sortLabel}
            variant="text"
            color={selected ? 'inherit' : 'secondary'}
            size="extraSmall"
            onClick={() => view.toggleSort(column)}
          >
            <FontAwesomeV6Icon
              iconName={
                sortDirection ? SORT_ICONS[kind][sortDirection] : 'sort'
              }
              iconStyle="solid"
            />
          </IconButton>
        </Tooltip>
      </span>
    </th>
  );
};

export default ColumnHeader;
