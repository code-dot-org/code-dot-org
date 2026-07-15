import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {isTargetEditable} from '@cdo/apps/util/isTargetEditable';

import {AppName} from '../types';

import KeyboardShortcuts from './KeyboardShortcuts';
import {ShortcutsPerLab} from './shortcutsPerLab';

import styles from './keyboard-shortcuts-listener.module.scss';

interface KeyboardShortcutsDialogProps {
  appName: AppName;
}

/**
 * Opens a keyboard-shortcuts popover when the user presses `/`, for any lab
 * that has an entry in ShortcutsPerLab. Mounted once per lab2 level (see
 * LabViewsRenderer).
 */
const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  appName,
}) => {
  const shortcuts = ShortcutsPerLab[appName];
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!shortcuts || isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.defaultPrevented ||
        isTargetEditable(event.target)
      ) {
        return;
      }
      event.preventDefault();
      setIsOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isOpen]);

  if (!shortcuts || !isOpen) {
    return null;
  }

  return (
    <CustomDialog
      onClose={() => setIsOpen(false)}
      closeLabel="Close keyboard shortcuts"
      aria-label="Keyboard shortcuts"
    >
      <div className={styles.dialog}>
        <Typography variant="h4" className={styles.title}>
          Keyboard shortcuts
        </Typography>
        <div
          id="dsco-dialog-description"
          className={styles.body}
          role="region"
          aria-label="Available keyboard shortcuts"
          // A scrollable region must be focusable to be keyboard-scrollable.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        >
          <KeyboardShortcuts shortcuts={shortcuts} />
        </div>
      </div>
    </CustomDialog>
  );
};

export default KeyboardShortcutsDialog;
