import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './keyboard-shortcuts.module.scss';

export interface KeyboardShortcut {
  /** The key combination, e.g. "Arrow keys", "Ctrl / Cmd + Z", "[". */
  shortcut: string;
  explanation: string;
}

/** A dictionary of category name to the shortcuts under that category. */
export type KeyboardShortcutCategories = Record<string, KeyboardShortcut[]>;

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcutCategories;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({shortcuts}) => {
  return (
    <div>
      <Typography variant="body3" className={styles.sectionHeading}>
        <FontAwesomeV6Icon iconName="keyboard" />
        <strong>Keyboard shortcuts</strong>
      </Typography>
      {Object.entries(shortcuts).map(([category, entries]) => (
        <div key={category} className={styles.category}>
          <Typography variant="overline2" className={styles.categoryHeading}>
            {category}
          </Typography>
          <dl className={styles.shortcutList}>
            {entries.map(({shortcut, explanation}) => (
              <div key={shortcut} className={styles.shortcutRow}>
                <dt className={styles.shortcutKeys}>
                  <kbd>{shortcut}</kbd>
                </dt>
                <dd className={styles.shortcutExplanation}>
                  <Typography variant="body4">{explanation}</Typography>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
};

export default KeyboardShortcuts;
