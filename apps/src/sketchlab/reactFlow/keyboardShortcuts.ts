import {KeyboardShortcutCategories} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/StudentResources/KeyboardShortcuts';

/**
 * Human-readable descriptions of the React Flow Sketch Lab keyboard shortcuts,
 * grouped by category for display in the student Resources panel. The bindings
 * themselves live in reactFlow/hooks/useKeyboardNavigation.ts, useCopyPaste.ts,
 * useInlineTextEditing.ts, and components/ReactFlowCanvas.tsx.
 */
export const SKETCH_LAB_KEYBOARD_SHORTCUTS: KeyboardShortcutCategories = {
  Navigation: [
    {
      shortcut: 'Tab',
      explanation: 'Move focus between elements (forward)',
    },
    {
      shortcut: 'Shift + Tab',
      explanation: 'Move focus between elements (backward)',
    },
  ],
  'Move & resize': [
    {shortcut: 'Arrow keys', explanation: 'Move the focused element'},
    {shortcut: '[ / ]', explanation: 'Shrink or grow the focused shape'},
    {shortcut: 'Shift + [ / ]', explanation: 'Resize width only'},
    {shortcut: 'Alt + [ / ]', explanation: 'Resize height only'},
  ],
  Editing: [
    {shortcut: 'Enter', explanation: 'Edit the focused element'},
    {shortcut: 'E', explanation: 'Open the element toolbar'},
    {shortcut: 'Esc', explanation: 'Finish editing or cancel'},
  ],
  Connecting: [
    {shortcut: 'C', explanation: 'Start or cancel a connection'},
    {shortcut: 'Enter', explanation: 'Connect to the focused element'},
  ],
  Grouping: [
    {shortcut: 'G', explanation: 'Enter group mode or create the group'},
    {shortcut: 'Enter', explanation: 'Add or remove the focused element'},
  ],
  'Clipboard & history': [
    {shortcut: 'Ctrl / Cmd + C', explanation: 'Copy'},
    {shortcut: 'Ctrl / Cmd + X', explanation: 'Cut'},
    {shortcut: 'Ctrl / Cmd + V', explanation: 'Paste'},
    {shortcut: 'Delete', explanation: 'Delete the selected element'},
    {shortcut: 'Ctrl / Cmd + Z', explanation: 'Undo'},
    {shortcut: 'Ctrl / Cmd + Y', explanation: 'Redo'},
  ],
};
