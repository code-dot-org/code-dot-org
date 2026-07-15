import {AppName} from '../types';

import {KeyboardShortcutCategories} from './types';

/**
 * Keyboard shortcuts to surface for each lab, keyed by app name.
 * A lab with an entry here gets the Resources-tab hint and the
 * `/`-triggered shortcuts popover automatically. The bindings themselves live
 * in each lab's own key handling; this is only the human-readable listing.
 */
export const ShortcutsPerLab: Partial<
  Record<AppName, KeyboardShortcutCategories>
> = {
  sketchlab: {
    Navigation: [
      {shortcut: 'Tab', explanation: 'Move focus between elements (forward)'},
      {
        shortcut: 'Shift + Tab',
        explanation: 'Move focus between elements (backward)',
      },
    ],
    'Move & resize': [
      {shortcut: 'Arrow keys', explanation: 'Move the focused element'},
      {shortcut: '[ / ]', explanation: 'Shrink or grow the focused shape'},
      {shortcut: 'Shift + [ / ]', explanation: 'Resize width only'},
      {shortcut: 'Alt / Opt + [ / ]', explanation: 'Resize height only'},
    ],
    Editing: [
      {shortcut: 'Enter', explanation: 'Edit the focused element'},
      {shortcut: 'E', explanation: 'Open the element toolbar'},
      {shortcut: 'Esc', explanation: 'Finish editing'},
    ],
    Connecting: [
      {shortcut: 'C', explanation: 'Start or cancel a connection'},
      {shortcut: 'Enter', explanation: 'Connect to the focused element'},
      {shortcut: 'Esc', explanation: 'Cancel connection'},
    ],
    Grouping: [
      {shortcut: 'G', explanation: 'Enter group mode or create the group'},
      {shortcut: 'Enter', explanation: 'Add or remove the focused element'},
      {shortcut: 'Esc', explanation: 'Cancel group mode'},
    ],
    'Clipboard & history': [
      {shortcut: 'Ctrl / Cmd + C', explanation: 'Copy'},
      {shortcut: 'Ctrl / Cmd + X', explanation: 'Cut'},
      {shortcut: 'Ctrl / Cmd + V', explanation: 'Paste'},
      {shortcut: 'Delete', explanation: 'Windows: Delete the selected element'},
      {
        shortcut: 'Fn + Delete',
        explanation: 'Mac: Delete the selected element',
      },
      {shortcut: 'Ctrl / Cmd + Z', explanation: 'Undo'},
      {shortcut: 'Ctrl / Cmd + Y', explanation: 'Redo'},
    ],
  },
};
