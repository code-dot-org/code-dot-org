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

/**
 * A named property's value on one actor, or nothing if it has no such property.
 *
 * Every property the actor carries: the ones its traits declare, and the ones
 * its own file declares, which belong to no trait — the same two places the map
 * editor's inspector looks. Nothing rather than a throw when there is no match:
 * an actor without the property is a project that has not done the lesson, and
 * that is a check's answer rather than its error.
 */
function readNamed(actor: Actor, name: string): unknown {
  const wanted = name.toLowerCase();
  const matches = (property: {id: string; name?: string}) =>
    property.id.toLowerCase() === wanted ||
    property.name?.toLowerCase() === wanted;
  for (const trait of actor.traits()) {
    for (const property of Object.values(trait.properties)) {
      if (matches(property)) {
        return actor.get(property);
      }
    }
  }
  for (const property of actor.ownProperties()) {
    if (matches(property)) {
      return actor.get(property);
    }
  }
  return undefined;
}

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
    case 'property':
      return [...world.actors]
        .filter(actor => isKind(actor, probe.of))
        .map(actor => readNamed(actor, probe.name));
    case 'drawings':
      return world
        .renderSnapshot()
        .filter(
          state =>
            (!probe.of || isKind(state.actor, probe.of)) && state.drawing,
        )
        .map(state => ({
          key: state.drawing!.key,
          width: state.drawing!.width,
          height: state.drawing!.height,
        }));
    case 'backdrop':
      return world.backdropSnapshot().map(backdrop => ({
        sprite: backdrop.sprite,
        repeat: backdrop.repeat,
        offset: {x: backdrop.offset.x, y: backdrop.offset.y},
      }));
    case 'effects': {
      // The document goes no further than the engine: a probe says WHICH
      // effect and how it is tuned, and the shader stays where it is.
      const named = (effects: readonly {path: string; values?: object}[]) =>
        effects.map(effect => ({
          path: effect.path,
          values: effect.values ?? {},
        }));
      return probe.of
        ? world
            .renderSnapshot()
            .filter(state => isKind(state.actor, probe.of!))
            .map(state => named(state.effects))
        : [
            named(world.effects()),
            ...world
              .backdropSnapshot()
              .map(backdrop => named(backdrop.effects)),
          ];
    }
    case 'cameras':
      return world.cameraSnapshot().map(camera => ({
        id: camera.id,
        x: camera.position.x,
        y: camera.position.y,
        active: camera.active,
      }));
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
  // The project's own `console.log` is evidence: a lesson that asks for a
  // message printed is checked by reading it (specs/PROGRESSION.md, the `trace`
  // kind). Captured HERE rather than only in the sandbox, or the runner the
  // tests use would report a silence the real one does not.
  const said: string[] = [];
  const realLog = console.log;
  console.log = (...args: unknown[]) => {
    said.push(args.map(String).join(' '));
  };

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
      if (step.set) {
        world.setWorldProperty(step.set.path, step.set.value);
      }
      world.setInput((step.hold ?? []).map(keyName));
      // …and what was TYPED, which is not a key. Handed over once and drained
      // by the first tick below, as the driver hands over what arrived between
      // two frames (`World.addTyped`).
      if (step.type?.length) {
        world.addTyped(step.type);
      }
      if (step.pointer) {
        world.setPointer(step.pointer, step.pointer.buttons ?? []);
      }
      const frames = Math.max(0, Math.round(step.seconds * CHECK_FPS));
      for (let frame = 0; frame < frames; frame++) {
        world.tick(1 / CHECK_FPS);
      }
      take();
    }
  } catch (thrown) {
    return {
      samples,
      console: said,
      error: thrown instanceof Error ? thrown.message : String(thrown),
    };
  } finally {
    console.log = realLog;
  }
  return {samples, console: said};
}
