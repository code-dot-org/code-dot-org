import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import closeDropdown from './closeDropdown';

import styles from './builder-menu.module.scss';

export interface BuilderMenuItem {
  label: string;
  onClick: () => void;
  iconName?: string;
  // For an item whose label needs its group's label to make sense.
  ariaLabel?: string;
  disabled?: boolean;
  // Turns the item off but keeps it focusable, to show this in a tooltip.
  disabledReason?: string;
  destructive?: boolean;
}

export type BuilderMenuEntry =
  | BuilderMenuItem
  | {groupLabel: string}
  | 'separator';

interface BuilderMenuProps {
  // Unique per instance; CustomDropdown uses it as the element id.
  name: string;
  // The trigger's accessible name, e.g. "Question options".
  label: string;
  entries: BuilderMenuEntry[];
  disabled?: boolean;
}

const MenuItem: React.FunctionComponent<BuilderMenuItem> = ({
  label,
  onClick,
  iconName,
  ariaLabel,
  disabled = false,
  disabledReason,
  destructive = false,
}) => (
  <li>
    <Tooltip describeChild title={disabledReason ?? ''} placement="left">
      <button
        type="button"
        className={classNames(styles.item, destructive && styles.destructive)}
        disabled={disabled}
        aria-disabled={disabledReason ? true : undefined}
        aria-label={ariaLabel}
        onClick={() => {
          if (disabledReason) {
            return;
          }
          onClick();
          closeDropdown();
        }}
      >
        {iconName && (
          <FontAwesomeV6Icon
            iconName={iconName}
            iconStyle="solid"
            className={styles.icon}
          />
        )}
        <span>{label}</span>
      </button>
    </Tooltip>
  </li>
);

// A "…" menu for an outline row. ActionDropdown has no separators or group
// labels, so it's built on CustomDropdown.
const BuilderMenu: React.FunctionComponent<BuilderMenuProps> = ({
  name,
  label,
  entries,
  disabled = false,
}) => (
  <CustomDropdown
    name={name}
    labelText={label}
    disabled={disabled}
    menuPlacement="right"
    size="xs"
    useMuiIconButtonAsTrigger
    triggerButtonProps={{
      children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
      color: 'tertiary',
      variant: 'outlined',
      size: 'extraSmall',
      'aria-label': label,
    }}
  >
    <ul className={styles.menu}>
      {entries.map((entry, index) =>
        entry === 'separator' ? (
          <li key={index} role="separator" className={styles.separator} />
        ) : 'groupLabel' in entry ? (
          <li key={index} className={styles.groupLabel} aria-hidden>
            {entry.groupLabel}
          </li>
        ) : (
          <MenuItem key={index} {...entry} />
        )
      )}
    </ul>
  </CustomDropdown>
);

export default BuilderMenu;
