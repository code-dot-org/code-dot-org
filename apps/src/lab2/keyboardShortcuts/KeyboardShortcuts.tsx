import {Typography} from '@mui/material';
import React from 'react';

import {KeyboardShortcutCategories} from './types';

import styles from './keyboard-shortcuts.module.scss';

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcutCategories;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({shortcuts}) => {
  return (
    <div>
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
