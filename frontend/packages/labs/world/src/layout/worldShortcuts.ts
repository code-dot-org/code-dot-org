// The keys World takes, as listed by its keyboard shortcuts dialog. The
// bindings live where each is handled; this is only the listing, and a key
// added there is added here by hand.

import type {KeyboardShortcutCategories} from '@code-dot-org/lab/components';

export const WORLD_SHORTCUTS: KeyboardShortcutCategories = {
  Anywhere: [
    {shortcut: '/', explanation: 'Show these keyboard shortcuts'},
    {shortcut: 'Ctrl / Cmd + Z', explanation: 'Undo, in the map editor'},
    {
      shortcut: 'Ctrl / Cmd + Shift + Z',
      explanation: 'Redo, in the map editor',
    },
    {shortcut: 'Ctrl / Cmd + Y', explanation: 'Redo, in the map editor'},
  ],
  'Actor Palette': [
    {
      shortcut: 'Enter or Space',
      explanation: 'Take an actor in hand and go to the map to place it',
    },
    {shortcut: 'Esc', explanation: 'Put the actor in hand down'},
  ],
  'The map, placing': [
    {shortcut: 'Arrow keys', explanation: 'Move the cursor a cell'},
    {
      shortcut: 'Enter or Space',
      explanation: 'Place one at the cursor, or take away the one there',
    },
    {
      shortcut: 'Esc',
      explanation:
        'Go back to the actor’s tile, still in hand; taken by a click, put it down',
    },
  ],
  'The map, selecting': [
    {shortcut: 'Arrow keys', explanation: 'Select the next or previous actor'},
    {shortcut: 'Shift + arrow', explanation: 'Move the selected actor a cell'},
    {
      shortcut: 'Shift + Alt / Opt + arrow',
      explanation: 'Move the selected actor a pixel',
    },
    {
      shortcut: 'Alt / Opt + arrow',
      explanation: 'Resize it; for a docked actor, move its edge',
    },
    {shortcut: '[ or ]', explanation: 'Turn it 15 degrees'},
    {shortcut: 'Enter', explanation: 'Open its code'},
    {shortcut: 'I', explanation: 'Go to its properties'},
    {shortcut: 'Delete / Backspace', explanation: 'Remove it'},
    {shortcut: 'Esc', explanation: 'Let go of it'},
  ],
  'Animation timeline': [
    {
      shortcut: 'Arrow keys',
      explanation: 'Move the playhead a tenth of a second',
    },
    {shortcut: 'Home or End', explanation: 'Go to the start or the end'},
    {
      shortcut: 'Alt / Opt + Left or Right',
      explanation: 'Move the focused key a tenth of a second',
    },
    {shortcut: 'Delete / Backspace', explanation: 'Delete the focused key'},
  ],
};
