// The demo worlds, by the rule each one demonstrates.
//
// Keyed by the stock rule's id, so a rule's demo is found the way everything
// else about it is. A rule with no entry has no demo yet, which the import
// dialog has to be comfortable with anyway (specs/RULE_DEMOS.md).

import {getDemoBaseUrl} from '../../runtime/worldConfig';

import {
  cameraConfinedDemo,
  cameraDeadzoneDemo,
  cameraEaseDemo,
  cameraFollowDemo,
} from './cameras';
import {collectDemo} from './collect';
import {dragDemo} from './drag';
import {expiresDemo} from './expires';
import {gravityDemo} from './gravity';
import {healthDemo} from './health';
import {physicsDemo} from './physics';
import {solidDemo} from './solid';
import {steeringDemo} from './steering';
import {DEMO_FPS, type RuleDemo} from './types';
import {wrapDemo} from './wrap';

export const RULE_DEMOS: Readonly<Record<string, RuleDemo>> = {
  // Keyed by the stock rule's id (`rules/stock`), in the order the shelf
  // lists them, so a demo is found the way everything else about a rule is.
  motion: physicsDemo,
  solid: solidDemo,
  collect: collectDemo,
  health: healthDemo,
  steering: steeringDemo,
  gravity: gravityDemo,
  drag: dragDemo,
  expires: expiresDemo,
  wrap: wrapDemo,
  cameraFollow: cameraFollowDemo,
  cameraEase: cameraEaseDemo,
  cameraDeadzone: cameraDeadzoneDemo,
  cameraConfined: cameraConfinedDemo,
};

/** The demo for a stock rule id, or undefined if it has none yet. */
export const ruleDemo = (id: string): RuleDemo | undefined => RULE_DEMOS[id];

export type {RuleDemo, RuleModules} from './types';
export {DEMO_FPS, DEMO_SIZE, viewOrigin} from './types';

/**
 * Where a rule's demo strip is served from, or undefined if it has none.
 *
 * A URL rather than bytes: the strips are assets, fetched like the stock
 * backdrops rather than carried in the bundle, so a learner who never opens
 * the import dialog never downloads one (specs/RULE_DEMOS.md).
 */
export function demoUrl(id: string): string | undefined {
  return RULE_DEMOS[id] ? `${getDemoBaseUrl()}${id}.png` : undefined;
}

/** How many cells that strip has — what the CSS steps through. */
export function demoFrames(id: string): number {
  const demo = RULE_DEMOS[id];
  return demo ? Math.round(demo.seconds * DEMO_FPS) : 0;
}
