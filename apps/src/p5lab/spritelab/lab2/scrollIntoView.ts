// Scroll a Blockly workspace so a rectangle is in view. Blockly's own
// scroll-into-view jumps; this one eases over SCROLL_MS and stops the moment
// the student touches the workspace.

import * as BlocklyCore from 'blockly/core';

/** Workspace units. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The visible part of the workspace, in workspace units. */
export interface View {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const SCROLL_MS = 300;

/**
 * The change to the scroll offset, in pixels, that brings `bounds` inside
 * `view` with `padding` around it; zero when it already is. A box too big
 * for the view shows its top left.
 */
export function scrollDelta(
  bounds: Box,
  view: View,
  scale: number,
  padding: number
): {dx: number; dy: number} {
  const right = view.left + view.width;
  const bottom = view.top + view.height;
  if (
    bounds.left >= view.left &&
    bounds.top >= view.top &&
    bounds.right <= right &&
    bounds.bottom <= bottom
  ) {
    return {dx: 0, dy: 0};
  }
  const padded = {
    left: bounds.left - padding,
    top: bounds.top - padding,
    right: bounds.right + padding,
    bottom: bounds.bottom + padding,
  };
  let dx = 0;
  let dy = 0;
  if (padded.left < view.left) {
    dx = view.left - padded.left;
  } else if (padded.right > right) {
    dx = right - padded.right;
  }
  if (padded.top < view.top) {
    dy = view.top - padded.top;
  } else if (padded.bottom > bottom) {
    dy = bottom - padded.bottom;
  }
  return {dx: dx * scale, dy: dy * scale};
}

export const easeOut = (t: number): number => 1 - (1 - t) ** 3;

const reducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const running = new WeakMap<BlocklyCore.WorkspaceSvg, () => void>();

/**
 * Scroll `bounds` into view over SCROLL_MS. A later call on the workspace
 * replaces an unfinished one. A pointer or wheel on the workspace, or a
 * drag, ends the scroll where it is. Under reduced motion it jumps.
 */
export function scrollIntoView(
  workspace: BlocklyCore.WorkspaceSvg,
  bounds: Box,
  padding = 0
): void {
  running.get(workspace)?.();
  if (!workspace.isMovable()) {
    return;
  }
  const view = workspace.getMetricsManager().getViewMetrics(true);
  const {dx, dy} = scrollDelta(bounds, view, workspace.getScale(), padding);
  if (!dx && !dy) {
    return;
  }
  const fromX = workspace.scrollX;
  const fromY = workspace.scrollY;
  if (reducedMotion()) {
    workspace.scroll(fromX + dx, fromY + dy);
    return;
  }
  const div = workspace.getInjectionDiv();
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    div.removeEventListener('pointerdown', stop, true);
    div.removeEventListener('wheel', stop, true);
    running.delete(workspace);
  };
  div.addEventListener('pointerdown', stop, true);
  div.addEventListener('wheel', stop, true);
  running.set(workspace, stop);
  let start: number | undefined;
  const step = (time: number) => {
    if (workspace.isDragging()) {
      stop();
      return;
    }
    start ??= time;
    const t = Math.min(1, (time - start) / SCROLL_MS);
    const eased = easeOut(t);
    workspace.scroll(fromX + dx * eased, fromY + dy * eased);
    if (t < 1) {
      frame = requestAnimationFrame(step);
    } else {
      stop();
    }
  };
  frame = requestAnimationFrame(step);
}
