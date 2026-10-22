import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import React, {useEffect, useId, useRef} from 'react';

import type {ColumnId, TableView} from '../types';

import styles from './tableFilter.module.scss';

interface TableFilterValueListProps {
  view: TableView;
  column: ColumnId;
  name: string;
  checked: string[];
  onBack: () => void;
}

const TableFilterValueList = ({
  view,
  column,
  name,
  checked,
  onBack,
}: TableFilterValueListProps) => {
  const headingId = useId();
  const backRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const options = view.filterOptions(column);

  useEffect(() => {
    (listRef.current?.querySelector('input') ?? backRef.current)?.focus();
  }, []);

  const setChecked = (option: string, isChecked: boolean) =>
    view.filterBy(
      column,
      options.filter(value =>
        value === option ? isChecked : checked.includes(value)
      )
    );

  return (
    <>
      <div className={styles.menuHeader}>
        <IconButton
          ref={backRef}
          aria-label="Back to columns"
          variant="text"
          color="tertiary"
          size="extraSmall"
          onClick={onBack}
        >
          <FontAwesomeV6Icon
            iconName="chevron-left"
            iconStyle="solid"
            aria-hidden="true"
          />
        </IconButton>
        <Typography
          id={headingId}
          variant="overline3"
          className={styles.menuTitle}
        >
          {name}
        </Typography>
      </div>
      <ul
        ref={listRef}
        role="group"
        aria-labelledby={headingId}
        className={styles.list}
      >
        {options.map(option => (
          <li key={option} className={styles.valueItem}>
            <Checkbox
              name={`Filter ${name}`}
              value={option}
              size="xs"
              label={option}
              checked={checked.includes(option)}
              onChange={event => setChecked(option, event.target.checked)}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export default TableFilterValueList;
