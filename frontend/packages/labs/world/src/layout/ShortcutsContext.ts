// Opens the keyboard shortcuts dialog, which the layout keeps; `null`
// outside it, as an editor alone in a test is.

import {createContext, useContext} from 'react';

export const ShortcutsContext = createContext<(() => void) | null>(null);

export const useOpenShortcuts = () => useContext(ShortcutsContext);
