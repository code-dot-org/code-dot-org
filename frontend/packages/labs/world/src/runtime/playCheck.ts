// Playing a check's script against a world, and reading the probes.
//
// Shared by the sandbox, which is where it runs in the product, and by the
// tests that play a SOLVED lesson to prove the check passes one. Both have to
// be the same code: a check tested against a different runner from the one that
// judges a learner is a check nobody has tested.
//
// Nothing here decides anything. It reports numbers; `Tile.check.passes` says
// what they mean, in the lab, where the catalogue is.

import type {Actor, World} from '../engine';
import {keyName} from '../engine/core/keys';

import {CHECK_FPS, type CheckResult, type CheckRun, type Probe} from './checks';

/**
 * Whether an actor is of the kind a probe names.
 *
 * BY EITHER NAME. An actor's `type` is the module it came from
 * (`actors/hero`) and its `name` is what the `define actor` block calls it
 * ("Hero") — a check is written by somebody reading the lesson, who knows the
 * second and has no reason to know the first. Accepting both also means a check
 * survives the learner renaming the file, which is a thing the lessons invite.
 */
const isKind = (actor: Actor, kind: string): boolean =>
  actor.type === kind || actor.name === kind;

/** Answer one probe about a world. */
export function readProbe(world: World, probe: Probe): unknown {
  switch (probe.kind) {
    case 'actorCount':
      return [...world.actors].filter(
        actor => !probe.of || isKind(actor, probe.of),
      ).length;
    case 'positions':
      return world
        .renderSnapshot()
        .filter(state => isKind(state.actor, probe.of))
        .map(state => ({x: state.x, y: state.y}));
    case 'drawnCount':
      return world
        .renderSnapshot()
        .filter(state => Boolean(state.frame ?? state.drawing)).length;
    case 'sprites':
      return world
        .renderSnapshot()
        .map(state => state.frame?.sprite)
        .filter((name): name is string => typeof name === 'string');
    case 'worldProperty':
      // The same map a hot-reload compares against (`WorldSnapshot.world`),
      // keyed the same way: `${ruleId}.${propId}`.
      return world.snapshot().world[probe.path];
  }
}

/**
 * Play the script and sample the probes: once before it starts, and again after
 * every step.
 *
 * A fixed timestep, and inputs measured in frames rather than in wall-clock
 * time, so the same project gives the same answer on a fast machine and a slow
 * one. A world that throws stops the run and reports why — a project that
 * crashes has failed its check, and the message is usually the actual mistake.
 */
export function playCheck(world: World, run: CheckRun): CheckResult {
  const samples: Record<string, unknown[]> = {};
  for (const name of Object.keys(run.probes)) {
    samples[name] = [];
  }
  const take = () => {
    for (const [name, probe] of Object.entries(run.probes)) {
      samples[name].push(readProbe(world, probe));
    }
  };

  try {
    take();
    for (const step of run.trace) {
      world.setInput((step.hold ?? []).map(keyName));
      const frames = Math.max(0, Math.round(step.seconds * CHECK_FPS));
      for (let frame = 0; frame < frames; frame++) {
        world.tick(1 / CHECK_FPS);
      }
      take();
    }
  } catch (thrown) {
    return {
      samples,
      console: [],
      error: thrown instanceof Error ? thrown.message : String(thrown),
    };
  }
  return {samples, console: []};
}
