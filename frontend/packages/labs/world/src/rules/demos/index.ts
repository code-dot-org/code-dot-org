// The demo worlds, by the rule each one demonstrates.
//
// Keyed by the stock rule's id, so a rule's demo is found the way everything
// else about it is. A rule with no entry has no demo yet, which the import
// dialog has to be comfortable with anyway (specs/RULE_DEMOS.md).

import {getDemoBaseUrl} from '../../runtime/worldConfig';

import {arrowsDemo} from './arrows';
import {attachmentDemo} from './attachment';
import {boundsDemo} from './bounds';
import {
  cameraConfinedDemo,
  cameraDeadzoneDemo,
  cameraEaseDemo,
  cameraFollowDemo,
} from './cameras';
import {carryDemo} from './carry';
import {collectDemo} from './collect';
import {conversationDemo} from './conversation';
import {dragDemo} from './drag';
import {driveDemo} from './drive';
import {expiresDemo} from './expires';
import {goalsDemo} from './goals';
import {gravityDemo} from './gravity';
import {gridDemo} from './grid';
import {healthDemo} from './health';
import {historyDemo} from './history';
import {inputDemo} from './input';
import {inventoryDemo} from './inventory';
import {jumpDemo} from './jump';
import {mouseDemo} from './mouse';
import {pathDemo} from './path';
import {patrolDemo} from './patrol';
import {physicsDemo} from './physics';
import {scoreDemo} from './score';
import {solidDemo} from './solid';
import {spawnerDemo} from './spawner';
import {steeringDemo} from './steering';
import {timeDemo} from './time';
import {turnsDemo} from './turns';
import {DEMO_FPS, type RuleDemo} from './types';
import {wrapDemo} from './wrap';
import {zapsDemo} from './zaps';

export const RULE_DEMOS: Readonly<Record<string, RuleDemo>> = {
  // Keyed by the stock rule's id (`rules/stock`), in the order the shelf
  // lists them, so a demo is found the way everything else about a rule is.
  motion: physicsDemo,
  solid: solidDemo,
  collect: collectDemo,
  inventory: inventoryDemo,
  health: healthDemo,
  steering: steeringDemo,
  path: pathDemo,
  patrol: patrolDemo,
  carry: carryDemo,
  grid: gridDemo,
  attachment: attachmentDemo,
  time: timeDemo,
  spawner: spawnerDemo,
  conversation: conversationDemo,
  score: scoreDemo,
  goals: goalsDemo,
  history: historyDemo,
  turns: turnsDemo,
  input: inputDemo,
  mouse: mouseDemo,
  arrows: arrowsDemo,
  gravity: gravityDemo,
  jump: jumpDemo,
  drive: driveDemo,
  drag: dragDemo,
  zaps: zapsDemo,
  expires: expiresDemo,
  bounds: boundsDemo,
  wrap: wrapDemo,
  cameraFollow: cameraFollowDemo,
  cameraEase: cameraEaseDemo,
  cameraDeadzone: cameraDeadzoneDemo,
  cameraConfined: cameraConfinedDemo,
};

/** The demo for a stock rule id, or undefined if it has none yet. */
export const ruleDemo = (id: string): RuleDemo | undefined => RULE_DEMOS[id];

export type {RuleDemo, RuleModules} from './types';
export {DEMO_FPS, DEMO_SIZE, stepDemo, viewOrigin} from './types';

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
