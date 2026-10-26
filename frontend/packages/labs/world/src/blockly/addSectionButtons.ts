// The "+" in each gap between sections, and after the last
// (specs/LAZY_WORKSPACE_PLAN.md, "Adding a section").
//
// Drawn as SVG inside the workspace's own canvas, so they scroll and zoom
// with the blocks and need no positioning of their own. A press opens the
// list of events a section can start with (`eventChoices`); it is taken off
// Blockly's gesture handling first, or a press on a "+" would start a pan.

import type {Blockly} from '@code-dot-org/blockly';

import {COLUMN_X} from './tidyLayout';

const CLASS = 'worldAddSection';
const RADIUS = 9;
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Take every "+" off the workspace. */
export function clearAddButtons(workspace: Blockly.WorkspaceSvg): void {
  workspace
    .getCanvas()
    .querySelectorAll(`.${CLASS}`)
    .forEach(node => node.remove());
}

/**
 * Put a "+" at each of `centers` (workspace y), down the column's left edge.
 *
 * `onPress` hears which gap — its y — and where on the screen the press was,
 * for the menu to open beside it.
 */
export function drawAddButtons(
  workspace: Blockly.WorkspaceSvg,
  centers: readonly number[],
  onPress: (y: number, clientX: number, clientY: number) => void,
): void {
  clearAddButtons(workspace);
  const canvas = workspace.getCanvas();
  for (const y of centers) {
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', CLASS);
    group.setAttribute('transform', `translate(${COLUMN_X - 4}, ${y})`);
    group.setAttribute('role', 'button');
    group.setAttribute('aria-label', 'Handle a new event here');
    group.style.cursor = 'pointer';
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('r', String(RADIUS));
    circle.setAttribute('fill', 'var(--background-neutral-primary, #fff)');
    circle.setAttribute('stroke', 'var(--borders-neutral-strong, #9aa0a6)');
    circle.setAttribute('stroke-width', '1.5');
    const plus = document.createElementNS(SVG_NS, 'path');
    plus.setAttribute('d', 'M -4 0 H 4 M 0 -4 V 4');
    plus.setAttribute('stroke', 'var(--text-neutral-secondary, #5b5f66)');
    plus.setAttribute('stroke-width', '1.8');
    plus.setAttribute('stroke-linecap', 'round');
    const title = document.createElementNS(SVG_NS, 'title');
    title.textContent = 'Handle a new event here';
    group.append(title, circle, plus);
    // Off Blockly's gesture handling: a press here is not the start of a
    // pan, and not a click on the workspace that would close the menu.
    group.addEventListener('pointerdown', event => event.stopPropagation());
    group.addEventListener('click', event => {
      event.stopPropagation();
      onPress(y, event.clientX, event.clientY);
    });
    canvas.appendChild(group);
  }
}
