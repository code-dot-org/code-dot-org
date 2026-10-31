// The trail, for the editors under the layout (specs/SHELL_PLAN.md, step 1).
//
// The layout keeps it; an editor that opens a place inside its own file — the
// map editor opening a placement's code — keeps that place on the trail
// rather than in state of its own, so the breadcrumb can go back from it.

import {createContext, useContext, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';

import {scriptOf, type ScriptStep, type Trail} from './trail';

export interface TrailContextValue {
  trail: Trail;
  /** Go back to the step at `index`. */
  goTo: (index: number) => void;
  /**
   * Follow the entry with `fileId` once it is in front: a file opened beside
   * the one in front rather than from inside it.
   */
  openBeside: (fileId: string) => void;
  /** Open `script` in `fileId`, or close the one open there. */
  setScript: (fileId: string, script: ScriptStep | null) => void;
  /** Where the breadcrumb bar holds the open page's actions (`TrailActions`). */
  actionsHost?: HTMLElement | null;
  setActionsHost?: (host: HTMLElement | null) => void;
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

/**
 * The open page's own actions, at the end of the breadcrumb bar: always in
 * the same place, and before the page in the tab order. Without the bar —
 * a test, an editor on its own — they are drawn where this stands, inside
 * `fallback`.
 */
export const TrailActions = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: (children: ReactNode) => ReactNode;
}) => {
  const host = useTrail()?.actionsHost;
  return host ? createPortal(children, host) : fallback(children);
};
