// Standing an actor demo up: import, place, compile, play, and film.
//
// The half of a demo that is not data. Both readers share it — the behavior
// test that asserts what the actor did and the recorder that films it — which
// is what keeps a recording honest: an actor that stops doing what its strip
// shows fails a test on the commit that caused it, rather than going on
// showing a thing it no longer does (specs/RULE_DEMOS.md).
//
// EVERYTHING IS THE REAL PATH. `importStockActor` is what the dialog calls,
// `compileProject` is what the sandbox does, and the keys are set the way the
// driver sets them. Nothing here knows anything about the Player in
// particular.

import {createRequire} from 'node:module';

import {compileProject} from '../../../__tests__/support/compileProject';
import type {Actor, World} from '../../../engine';
import * as WorldLab from '../../../engine';
import {PositionProperty} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {pointerFor} from '../../../rules/demos/device';
import {rgb, type Cell} from '../../../rules/demos/record/strip';
import {projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {
  ACTOR_DEMO_SHRINK,
  ACTOR_DEMO_SIZE,
  type ActorDemo,
  type ActorPlacement,
  type PointerAt,
} from '../types';

/**
 * The stock drawings as PIXELS, from the script that draws them.
 *
 * Not decoded from the PNGs the lab ships: those are encoded from exactly
 * this, and a decoder here would be a second copy of the format to keep in
 * step (`scripts/generate-sprites`). `createRequire` because it is plain ESM
 * JavaScript in a TypeScript build, which is how the recorder already reaches
 * the PNG writer.
 */
const stockPixels = () =>
  (
    createRequire(import.meta.url)(
      '../../../../scripts/generate-sprites.mjs',
    ) as {
      stockPixels: () => Record<
        string,
        {width: number; height: number; data: Uint8Array}
      >;
    }
  ).stockPixels();

/** `add actor ⟨path⟩`, put at one place — what a world's blocks say. */
const placeBlock = (path: string, {x, y}: ActorPlacement) => ({
  type: 'world_add_actor',
  fields: {ACTOR: path},
  inputs: {
    DO: {
      block: {
        type: 'world_set_position',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          X: {block: {type: 'math_number', fields: {NUM: x}}},
          Y: {block: {type: 'math_number', fields: {NUM: y}}},
        },
      },
    },
  },
});

export interface StagedDemo {
  world: World;
  /** The actor the demo is ABOUT, which is what an assertion talks about. */
  subject: Actor;
  /** Every compiled module by path — what `drive` reaches properties through. */
  modules: Record<string, Record<string, unknown>>;
}

/** The engine itself, for the properties that belong to no rule. */
const engine = WorldLab;

/**
 * Import the demo's actors into an empty project, place them, and compile it.
 *
 * The subject is found by where it was PUT: an actor's id is generated rather
 * than named after its file, and its placement is the one thing the demo said
 * about it that survives into the world.
 */
export async function stageActorDemo(
  id: string,
  demo: ActorDemo,
): Promise<StagedDemo> {
  let source = WORLD_SCENARIOS.empty.source;
  const paths: Record<string, string> = {};
  for (const actorId of [id, ...(demo.supporting ?? [])]) {
    const stock = stockActorById(actorId);
    if (!stock) {
      throw new Error(`actor demo "${id}": no stock actor "${actorId}"`);
    }
    const imported = importStockActor(source, stock);
    source = imported.source;
    paths[actorId] = imported.path;
  }

  // The placements, innermost last: a `.world` is one chain of blocks, and the
  // chain is built from the end so each block carries the rest as its `next`.
  let chain: unknown;
  for (const placement of [...demo.cast].reverse()) {
    const path = paths[placement.actor];
    if (!path) {
      throw new Error(
        `actor demo "${id}": "${placement.actor}" is not in the cast`,
      );
    }
    chain = chain
      ? {...placeBlock(path, placement), next: {block: chain}}
      : placeBlock(path, placement);
  }

  const file = Object.values(source.files).find(
    one => one.name === 'main.world',
  )!;
  const staged = {
    ...source,
    files: {
      ...source.files,
      [file.id]: {
        ...file,
        contents: JSON.stringify({
          blocks: {
            blocks: [
              {
                type: 'world_world',
                x: 20,
                y: 20,
                fields: {NAME: 'Demo'},
                next: {block: chain},
              },
            ],
          },
        }),
      },
    },
  };

  const {world, modules} = await compileProject(projectFiles(staged));
  const placed = demo.cast.find(one => one.actor === id);
  if (!placed) {
    throw new Error(`actor demo "${id}": its own actor is not in the cast`);
  }
  const subject = [...world.actors].find(actor => {
    const position = actor.get(PositionProperty);
    return position.x === placed.x && position.y === placed.y;
  });
  if (!subject) {
    throw new Error(`actor demo "${id}": nothing was placed at its position`);
  }
  const stage = {world, subject, modules};
  // The handlers a project would have written, before anything has happened.
  demo.wire?.({...stage, engine, seconds: 0});
  return stage;
}

/**
 * One frame: the keyboard, then the shutter, then the tick.
 *
 * That order, for the reason `stepDemo` gives on the rule side: a frame drawn
 * before the input was applied shows a key taking effect one frame after the
 * actor it moved. Both readers step through here, so neither can drift.
 */
export function stepActorDemo(
  staged: StagedDemo,
  demo: ActorDemo,
  tick: number,
  capture?: () => void,
): void {
  const seconds = tick / 60;
  staged.world.setInput(demo.keys?.(seconds) ?? []);
  const pointer = demo.pointer?.(seconds);
  if (pointer) {
    // VIEWPORT pixels, which is what a driver hands over and is a different
    // rectangle from the demo's frame: handing this world coordinates puts the
    // pointer some ninety pixels adrift and every click misses in silence
    // (`rules/demos/device`, where that was found the first time).
    staged.world.setPointer(
      pointerFor(staged.world, new WorldLab.Vector(pointer.x, pointer.y)),
      pointer.down ? ['left'] : [],
    );
  }
  // What the GAME does this frame, for an actor that is shown things rather
  // than played — before the shutter, for the same reason the keyboard is.
  demo.drive?.({...staged, engine, seconds});
  capture?.();
  staged.world.tick(1 / 60);
}

/**
 * The cursor, drawn where the demo says the pointer is.
 *
 * Not an actor: nothing in a project is, and the shelf has no cursor to
 * import. The rule demos draw theirs as one because those worlds are built by
 * hand; here it is an overlay on the frame, which is the same idea and one
 * fewer fiction in the world.
 *
 * A small square that fattens and brightens while the button is down, which is
 * what the mouse RULE's demo draws, so the two dialogs agree about what a
 * click looks like.
 */
const cursorCell = (pointer: PointerAt, shrink: number): Cell => {
  const size = (pointer.down ? 14 : 8) / shrink;
  return {
    id: 'pointer',
    x: pointer.x / shrink,
    y: pointer.y / shrink,
    width: Math.max(2, Math.round(size)),
    height: Math.max(2, Math.round(size)),
    color: rgb(pointer.down ? '#ffffff' : '#abb2bf'),
  };
};

/**
 * What the recorder would draw this frame, in strip pixels.
 *
 * The demo frame is the world rectangle from its origin — no camera, because
 * no actor demo has a camera rule in it and a view that followed one would be
 * demonstrating the camera. Everything is shrunk by a whole number on the way
 * out (`ACTOR_DEMO_SHRINK`).
 *
 * Shared with the test on purpose: what it checks is then what a reader sees,
 * rather than a position the drawing might not agree with.
 */
export function actorDemoFrame(
  id: string,
  world: World,
  demo: ActorDemo,
  seconds: number,
): Cell[] {
  const images = stockPixels();
  const shrink = demo.shrink ?? ACTOR_DEMO_SHRINK;
  const pointer = demo.pointer?.(seconds);
  return (
    [...world.renderSnapshot()]
      // By layer, as the driver sorts: a Player behind its own floor would be a
      // recording of a floor.
      .sort((one, other) => one.layer - other.layer)
      .map((state): Cell => {
        const actorId = (state.actor as unknown as {id: string}).id;
        if (state.drawing) {
          // A drawn actor — a Label, a bar, a Speech Box — whose picture is
          // the commands its kind describes. It WINS over a frame when both
          // are there, which is the driver's own rule (specs/DRAWING.md).
          return {
            id: actorId,
            x: state.x / shrink,
            y: state.y / shrink,
            width: state.drawing.width,
            height: state.drawing.height,
            // One number for both axes: a drawing scaled differently across
            // than down is not something any stock actor does, and a second
            // scale here would be arithmetic nothing exercises.
            scale: Math.abs(state.scaleX) / shrink,
            opacity: state.opacity,
            commands: state.drawing.commands,
          };
        }
        if (!state.frame) {
          // Neither a picture nor a drawing: the driver paints a plain
          // rectangle for this, and a demo whose subject is one is
          // demonstrating nothing.
          throw new Error(
            `actor demo "${id}": "${actorId}" has nothing to draw`,
          );
        }
        const name = state.frame.sprite.replace(/\.png$/, '');
        const image = images[name];
        if (!image) {
          throw new Error(
            `actor demo "${id}": "${actorId}" wears "${state.frame.sprite}", which is not a stock drawing`,
          );
        }
        const source = state.frame.cell ?? {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        };
        const scale = state.frame.scale / shrink;
        return {
          id: actorId,
          x: (state.x + state.frame.offset.x) / shrink,
          y: (state.y + state.frame.offset.y) / shrink,
          width: Math.round(source.width * Math.abs(state.scaleX) * scale),
          height: Math.round(source.height * Math.abs(state.scaleY) * scale),
          flip: state.scaleX < 0,
          opacity: state.opacity,
          pixels: image,
          source,
        };
      })
      // The cursor last, so it is drawn over what it is pointing at — which is
      // where a pointer is on every screen there has ever been.
      .concat(pointer ? [cursorCell(pointer, shrink)] : [])
  );
}

/** Whether a drawn cell is inside the frame at all — in strip pixels. */
export const inFrame = (cell: Cell): boolean =>
  cell.x + cell.width / 2 > 0 &&
  cell.x - cell.width / 2 < ACTOR_DEMO_SIZE.width &&
  cell.y + cell.height / 2 > 0 &&
  cell.y - cell.height / 2 < ACTOR_DEMO_SIZE.height;
