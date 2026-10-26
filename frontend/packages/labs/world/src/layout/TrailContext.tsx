// The trail, for the editors under the layout (specs/SHELL_PLAN.md, step 1).
//
// The layout keeps it; an editor that opens a place inside its own file — the
// map editor opening a placement's code — keeps that place on the trail
// rather than in state of its own, so the breadcrumb can go back from it.

import {createContext, useContext, useState} from 'react';

import {scriptOf, type ScriptStep, type Trail} from './trail';

export interface TrailContextValue {
  trail: Trail;
  /** Go back to the step at `index`. */
  goTo: (index: number) => void;
  /** Open `script` in `fileId`, or close the one open there. */
  setScript: (fileId: string, script: ScriptStep | null) => void;
}

export const TrailContext = createContext<TrailContextValue | null>(null);

export const useTrail = () => useContext(TrailContext);

/**
 * The script open in `fileId`, and how to open or close one: on the trail
 * under the layout, and in the caller's own state without it, which is how a
 * test renders an editor.
 */
export function useScriptStep(
  fileId: string,
): [ScriptStep | null, (script: ScriptStep | null) => void, boolean] {
  const trail = useTrail();
  const [own, setOwn] = useState<ScriptStep | null>(null);
  if (!trail) {
    return [own, setOwn, false];
  }
  return [
    scriptOf(trail.trail, fileId),
    script => trail.setScript(fileId, script),
    true,
  ];
}
