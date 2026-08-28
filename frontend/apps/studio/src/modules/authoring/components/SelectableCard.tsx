import {IconButton} from '@mui/material';
import classNames from 'classnames';
import type {ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './authoring.module.scss';

interface SelectableCardProps {
  authorMode: boolean;
  selected: boolean;
  onSelect: () => void;
  selectLabel: string;
  className?: string;
  children: ReactNode;
}

/**
 * The click-to-edit affordance LevelInstructions established (hover
 * highlight, a pencil button that pins the properties panel open on this
 * section) — generalized for stage components that have exactly one panel
 * section: a generic-runtime level's whole render, and a widget's sandboxed
 * iframe. The wrapping card (`className`) always renders, in both audiences
 * — only the edit bar and the hover/selected outline are author-mode-only.
 */
export default function SelectableCard({
  authorMode,
  selected,
  onSelect,
  selectLabel,
  className,
  children,
}: SelectableCardProps) {
  return (
    <div
      className={classNames(
        className,
        authorMode && styles.selectableCardEditable,
        authorMode && selected && styles.selectableCardSelected,
      )}
    >
      {authorMode && (
        <div className={styles.selectableCardEditBar}>
          <IconButton
            size="small"
            aria-label={selectLabel}
            aria-pressed={selected}
            onClick={onSelect}
          >
            <FontAwesomeV6Icon iconName="pen-to-square" iconStyle="solid" />
          </IconButton>
        </div>
      )}
      {children}
    </div>
  );
}
