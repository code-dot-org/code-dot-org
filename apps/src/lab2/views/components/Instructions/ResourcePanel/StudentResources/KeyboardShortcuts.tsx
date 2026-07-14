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
        <table key={category} className={styles.shortcutTable}>
          <caption>
            <Typography variant="overline3" className={styles.categoryHeading}>
              {category}
            </Typography>
          </caption>
          <tbody>
            {entries.map(({shortcut, explanation}) => (
              <tr key={shortcut}>
                <th scope="row" className={styles.shortcutKeys}>
                  <kbd>{shortcut}</kbd>
                </th>
                <td className={styles.shortcutExplanation}>
                  <Typography variant="body4" component="span">
                    {explanation}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
};

export default KeyboardShortcuts;
