import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {type ReactNode} from 'react';

import type {TableView} from '../useTableView';

import tableStyles from './dataTable.module.scss';

const SORT_ICONS = {
  ascending: 'sort-up',
  descending: 'sort-down',
  none: 'sort',
};

interface ColumnHeaderProps {
  column: string;
  name: string;
  view?: TableView;
  className?: string;
  children: ReactNode;
}

const ColumnHeader = ({
  column,
  name,
  view,
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

  const sortDirection = view.sortDirection(column);
  const sortLabel = `Sort by ${name}`;

  return (
    <th
      scope="col"
      aria-sort={sortDirection}
      className={classNames(className, tableStyles.headerWithControls)}
    >
      <div className={tableStyles.headerContent}>
        <span className={tableStyles.headerName}>{children}</span>
        <Tooltip title={sortLabel}>
          <IconButton
            aria-label={sortLabel}
            variant="text"
            color="inherit"
            size="extraSmall"
            onClick={() => view.toggleSort(column)}
          >
            <FontAwesomeV6Icon
              iconName={SORT_ICONS[sortDirection ?? 'none']}
              iconStyle="solid"
            />
          </IconButton>
        </Tooltip>
      </div>
    </th>
  );
};

export default ColumnHeader;
