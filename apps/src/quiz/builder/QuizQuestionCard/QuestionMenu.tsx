import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import closeDropdown from '../closeDropdown';

import styles from './question-menu.module.scss';

interface QuestionMenuProps {
  // Unique per instance; CustomDropdown uses it as the element id.
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  // The quiz's other pages, which the question can move to.
  otherPages: number[];
  onMove: (offset: -1 | 1) => void;
  onMoveToPage: (page: number) => void;
  onRemove: () => void;
}

const MenuItem: React.FunctionComponent<{
  iconName?: string;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
}> = ({
  iconName,
  label,
  ariaLabel,
  disabled = false,
  destructive = false,
  onClick,
}) => (
  <li>
    <button
      type="button"
      className={classNames(styles.item, destructive && styles.destructive)}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => {
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
  </li>
);

const Separator = () => <li role="separator" className={styles.separator} />;

// ActionDropdown has no separators or group labels, so the menu is built
// on CustomDropdown.
const QuestionMenu: React.FunctionComponent<QuestionMenuProps> = ({
  name,
  canMoveUp,
  canMoveDown,
  otherPages,
  onMove,
  onMoveToPage,
  onRemove,
}) => (
  <CustomDropdown
    name={name}
    labelText="Question options"
    menuPlacement="right"
    size="xs"
    useMuiIconButtonAsTrigger
    triggerButtonProps={{
      children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
      color: 'tertiary',
      variant: 'outlined',
      size: 'extraSmall',
      'aria-label': 'Question options',
    }}
  >
    <ul className={styles.menu}>
      <MenuItem
        iconName="arrow-up"
        label="Move question up"
        disabled={!canMoveUp}
        onClick={() => onMove(-1)}
      />
      <MenuItem
        iconName="arrow-down"
        label="Move question down"
        disabled={!canMoveDown}
        onClick={() => onMove(1)}
      />
      {otherPages.length > 0 && (
        <>
          <Separator />
          <li className={styles.groupLabel} aria-hidden>
            Move to page
          </li>
          {otherPages.map(page => (
            <MenuItem
              key={page}
              label={`Page ${page}`}
              ariaLabel={`Move to Page ${page}`}
              onClick={() => onMoveToPage(page)}
            />
          ))}
        </>
      )}
      <Separator />
      <MenuItem
        iconName="trash-can"
        label="Remove from quiz"
        destructive
        onClick={onRemove}
      />
    </ul>
  </CustomDropdown>
);

export default QuestionMenu;
