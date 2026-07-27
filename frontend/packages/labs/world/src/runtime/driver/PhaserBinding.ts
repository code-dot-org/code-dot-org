// Turns a built World into a running Phaser 4 game (specs/PLAN.md §10). One
// Phaser.Game with a single Scene bridges to our World: on each frame it ticks
// the engine with the real delta (ENGINE.md's real-time requirement) and
// reconciles every positional actor's transform onto a GameObject.
//
// This is DRIVER code — it runs on the preview surface and imports `phaser` at
// runtime. It imports `world-lab` only for TYPES (erased at build), and reads
// the world through `renderSnapshot()` / `tick()` — methods on the *learner's*
// engine instance — so there is exactly one engine instance and no Property
// identity to marshal across a module boundary.
//
// Appearance: an actor whose `sprite` render field names a built-in sprite is
// drawn as that texture (preloaded from the self-hosted `${assetBase}sprites/`);
// an actor with no sprite falls back to a plain rectangle. Spritesheets and
// animations are later work (the asset pipeline / GLOSSARY.md).
//
// Input: each frame we read Phaser's cursor keys and hand the pressed set to the
// World (`setInput`) before ticking, so the engine's Input rule can drive
// controlled actors. Phaser attaches its keyboard listeners to the game canvas,
// so the preview iframe must have focus for keys to register.

import Phaser from 'phaser';

import type {Actor, RenderState, World} from 'world-lab';

import {SPRITE_NAMES} from '../../sprites';

const ACTOR_SIZE = 24;
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const DEGREES_TO_RADIANS = Math.PI / 180;
const DEFAULT_ASSET_BASE = '/vendor/';

/** A drawn actor — a textured sprite or the fallback rectangle. */
type GameObject = Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

/** Phaser cursor keys → the DOM `KeyboardEvent.key` names the engine expects. */
function pressedKeys(
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined,
): string[] {
  if (!cursors) {
    return [];
  }
  const map: Array<[Phaser.Input.Keyboard.Key | undefined, string]> = [
    [cursors.left, 'ArrowLeft'],
    [cursors.right, 'ArrowRight'],
    [cursors.up, 'ArrowUp'],
    [cursors.down, 'ArrowDown'],
    [cursors.space, ' '],
  ];
  return map.filter(([key]) => key?.isDown).map(([, name]) => name);
}

export class PhaserBinding {
  private readonly game: Phaser.Game;

  constructor(
    world: World,
    parent: HTMLElement,
    assetBase: string = DEFAULT_ASSET_BASE,
  ) {
    const objects = new Map<Actor, GameObject>();
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    // Create the object for an actor once, choosing sprite vs rectangle from its
    // current sprite name (a loaded texture wins; otherwise the rectangle).
    const create = (scene: Phaser.Scene, state: RenderState): GameObject =>
      state.sprite && scene.textures.exists(state.sprite)
        ? scene.add.image(state.x, state.y, state.sprite)
        : scene.add.rectangle(
            state.x,
            state.y,
            ACTOR_SIZE,
            ACTOR_SIZE,
            0x33cc66,
          );

    const sync = (scene: Phaser.Scene) => {
      for (const state of world.renderSnapshot() as RenderState[]) {
        let object = objects.get(state.actor);
        if (!object) {
          object = create(scene, state);
          objects.set(state.actor, object);
        }
        object.setPosition(state.x, state.y);
        object.setScale(state.scaleX, state.scaleY);
        object.setRotation(state.rotation * DEGREES_TO_RADIANS);
      }
    };

    this.game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent,
      width: parent.clientWidth || DEFAULT_WIDTH,
      height: parent.clientHeight || DEFAULT_HEIGHT,
      backgroundColor: '#101020',
      banner: false,
      audio: {noAudio: true},
      scene: {
        preload(this: Phaser.Scene) {
          for (const name of SPRITE_NAMES) {
            this.load.image(name, `${assetBase}sprites/${name}.png`);
          }
        },
        create(this: Phaser.Scene) {
          cursors = this.input.keyboard?.createCursorKeys();
          sync(this);
        },
        update(this: Phaser.Scene, _time: number, delta: number) {
          // Feed this frame's keys in before advancing the simulation.
          world.setInput(pressedKeys(cursors));
          // Phaser's delta is milliseconds; the engine ticks in seconds.
          world.tick(delta / 1000);
          sync(this);
        },
      },
    });
  }

  /** Tear the game down: stops the loop and releases the canvas. */
  stop(): void {
    this.game.destroy(true);
  }
}
