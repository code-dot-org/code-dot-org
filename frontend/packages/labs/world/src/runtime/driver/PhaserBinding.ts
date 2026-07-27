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
// The slice draws each actor as a plain rectangle; sprites and animations are
// later work (the asset pipeline).

import Phaser from 'phaser';

import type {Actor, RenderState, World} from 'world-lab';

const ACTOR_SIZE = 24;
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const DEGREES_TO_RADIANS = Math.PI / 180;

export class PhaserBinding {
  private readonly game: Phaser.Game;

  constructor(world: World, parent: HTMLElement) {
    const objects = new Map<Actor, Phaser.GameObjects.Rectangle>();

    const sync = (scene: Phaser.Scene) => {
      for (const state of world.renderSnapshot() as RenderState[]) {
        let rectangle = objects.get(state.actor);
        if (!rectangle) {
          rectangle = scene.add.rectangle(
            state.x,
            state.y,
            ACTOR_SIZE,
            ACTOR_SIZE,
            0x33cc66,
          );
          objects.set(state.actor, rectangle);
        }
        rectangle.setPosition(state.x, state.y);
        rectangle.setScale(state.scaleX, state.scaleY);
        rectangle.setRotation(state.rotation * DEGREES_TO_RADIANS);
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
        create(this: Phaser.Scene) {
          sync(this);
        },
        update(this: Phaser.Scene, _time: number, delta: number) {
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
