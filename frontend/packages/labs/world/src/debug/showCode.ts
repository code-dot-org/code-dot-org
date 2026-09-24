// Whether the editor pane is showing a file's blocks or the JavaScript they
// become.
//
// Two places need the same answer and neither contains the other: the button
// that asks for it lives in the workspace panel's header (`layout/WorldLayout`)
// and the switch that obeys it is around each Blockly editor, several
// components down inside Codebridge's `Workspace` (`config.editorComponents`).
// A context is the shortest line between them.
//
// A CONTEXT RATHER THAN A MODULE-LEVEL SETTER — the shape the lab uses for
// `setRevealer` and friends — because this one is read during render, and a
// value read during render has to be one React knows changed.

import {createContext, useContext} from 'react';

/** What the pane is showing, and how to go back. */
export interface ShowCodeState {
  /** Whether the JavaScript is up in place of the editor. */
  showing: boolean;
  /** Put the editor back. What the view's own "Back" does. */
  hide: () => void;
}

/**
 * The default is the honest one for a tree with no provider: the editor.
 *
 * A Blockly editor mounted outside `WorldLayout` — the dev demos, the tests —
 * then behaves as it always did rather than throwing for want of a provider it
 * has no reason to know about.
 */
export const ShowCodeContext = createContext<ShowCodeState>({
  showing: false,
  hide: () => {},
});

export const useShowCode = (): ShowCodeState => useContext(ShowCodeContext);
