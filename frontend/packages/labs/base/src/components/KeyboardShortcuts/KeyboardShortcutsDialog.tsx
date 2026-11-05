import {Typography} from '@mui/material';
import type {FunctionComponent} from 'react';
import {useEffect} from 'react';

import {MuiCustomDialog as CustomDialog} from '@code-dot-org/component-library/dialog';

import KeyboardShortcuts from './KeyboardShortcuts';
import type {KeyboardShortcutCategories} from './types';

import styles from './keyboard-shortcuts-dialog.module.scss';

export interface KeyboardShortcutsDialogProps {
  shortcuts: KeyboardShortcutCategories;
  isOpen: boolean;
  onClose: () => void;
}

/** True where typing is the point: an input, a textarea, or contentEditable. */
const isTargetEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA');

/**
 * Calls `onOpen` when `/` is pressed with no modifier but Shift, outside
 * anything typed into, and not already claimed by the focused element.
 * The same key lab2 labs use (apps/src/lab2/keyboardShortcuts).
 */
export const useKeyboardShortcutsKey = (onOpen: () => void, enabled = true) => {
  useEffect(() => {
    if (!enabled) {
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
      onOpen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen, enabled]);
};

const KeyboardShortcutsDialog: FunctionComponent<
  KeyboardShortcutsDialogProps
> = ({shortcuts, isOpen, onClose}) =>
  isOpen ? (
    <CustomDialog
      onClose={onClose}
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
          tabIndex={0}
        >
          <KeyboardShortcuts shortcuts={shortcuts} />
        </div>
      </div>
    </CustomDialog>
  ) : null;

export default KeyboardShortcutsDialog;
