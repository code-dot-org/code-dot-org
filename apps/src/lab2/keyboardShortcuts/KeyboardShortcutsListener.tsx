import React, {useEffect, useRef} from 'react';

import {AppName} from '../types';
import {DialogType, useDialogControl} from '../views/dialogs';

import KeyboardShortcuts from './KeyboardShortcuts';
import {ShortcutsPerLab} from './shortcutsPerLab';

interface KeyboardShortcutsListenerProps {
  appName: AppName;
}

// True when the event target is a text-editing context (input, textarea, or
// contentEditable), where the user is typing and `/` should insert a character
// rather than open the popover.
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
}

/**
 * Opens a keyboard-shortcuts popover when the user presses `/`, for any lab
 * that has an entry in ShortcutsPerLab. Renders nothing. Mounted once per lab2
 * level (see LabViewsRenderer) as a descendant of the dialog provider.
 */
const KeyboardShortcutsListener: React.FC<KeyboardShortcutsListenerProps> = ({
  appName,
}) => {
  const dialogControl = useDialogControl();
  // Prevents a second `/` from stacking another dialog while one is open.
  const isOpenRef = useRef(false);

  useEffect(() => {
    const shortcuts = ShortcutsPerLab[appName];
    if (!shortcuts) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.defaultPrevented ||
        isOpenRef.current ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      isOpenRef.current = true;
      dialogControl
        .showDialog({
          type: DialogType.GenericDialog,
          title: 'Keyboard shortcuts',
          bodyComponent: <KeyboardShortcuts shortcuts={shortcuts} />,
          useModal: true,
        })
        .finally(() => {
          isOpenRef.current = false;
        });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appName, dialogControl]);

  return null;
};

export default KeyboardShortcutsListener;
