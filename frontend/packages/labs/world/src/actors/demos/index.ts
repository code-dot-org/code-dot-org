// The demo scenes, by the stock actor each one demonstrates.
//
// Keyed by the actor's id, so an actor's demo is found the way everything else
// about it is. An actor with no entry has no demo, which the import dialog has
// to be comfortable with anyway — it showed a still and nothing else until
// this existed, and still does for the actors whose worth IS the picture.

import {DEMO_FPS} from '../../rules/demos';
import {getDemoBaseUrl} from '../../runtime/worldConfig';

import {buttonDemo} from './button';
import {coinDemo} from './coin';
import {groundDemo} from './ground';
import {labelDemo} from './label';
import {playerDemo} from './player';
import {portraitDemo} from './portrait';
import {progressBarDemo} from './progressBar';
import {speechBoxDemo} from './speechBox';
import type {ActorDemo} from './types';

export const ACTOR_DEMOS: Readonly<Record<string, ActorDemo>> = {
  // In the order the shelf lists them (`actors/stock`), so a demo is found the
  // way everything else about an actor is.
  label: labelDemo,
  progressBar: progressBarDemo,
  // No Health Bar, and it is the only one: it shows the health of whoever it
  // is pointed at, and nothing on the shelf has any — the stock Player
  // deliberately leaves Health to the game that imports it. A demo would have
  // to invent the actor whose health it showed, which is a demonstration of
  // the demo.
  button: buttonDemo,
  speechBox: speechBoxDemo,
  portrait: portraitDemo,
  coin: coinDemo,
  player: playerDemo,
  ground: groundDemo,
};

/** The demo for a stock actor id, or undefined if it has none yet. */
export const actorDemo = (id: string): ActorDemo | undefined => ACTOR_DEMOS[id];

export type {ActorDemo, ActorPlacement} from './types';
export {ACTOR_DEMO_SHRINK, ACTOR_DEMO_SIZE, ACTOR_DEMO_WORLD} from './types';

/**
 * Where an actor's demo strip is served from, or undefined if it has none.
 *
 * Beside the rule strips and under `actors/`, because they are the same kind
 * of thing produced by the same build step and served from the same place
 * (specs/RULE_DEMOS.md). The folder keeps a rule called `player` and an actor
 * called `player` from being one file.
 */
export function actorDemoUrl(id: string): string | undefined {
  return ACTOR_DEMOS[id] ? `${getDemoBaseUrl()}actors/${id}.png` : undefined;
}

/** How many cells that strip has — what the CSS steps through. */
export function actorDemoFrames(id: string): number {
  const demo = ACTOR_DEMOS[id];
  return demo ? Math.round(demo.seconds * DEMO_FPS) : 0;
}
