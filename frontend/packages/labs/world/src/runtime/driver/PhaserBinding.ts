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
// Appearance: the ENGINE owns animation timing (rules/animation.ts) and resolves
// each actor's current frame; `renderSnapshot` hands it over as a `frame`
// descriptor and this binding just blits it — a textured Image cropped to the
// frame's spritesheet cell (or a whole single image), else a plain rectangle for
// an actor with no appearance. Phaser is a renderer, not the animator. All
// textures/spritesheets are preloaded from the self-hosted `${assetBase}sprites/`.
//
// Input: each frame we read Phaser's cursor keys and hand the pressed set to the
// World (`setInput`) before ticking, so the engine's Input rule can drive
// controlled actors. Phaser attaches its keyboard listeners to the game canvas,
// so the preview iframe must have focus for keys to register.

import Phaser from 'phaser';

import type {Actor, RenderState, World} from 'world-lab';

import {SPRITESHEET_NAMES, SPRITE_NAMES, SPRITE_SIZE} from '../../sprites';

const ACTOR_SIZE = 24;
// The game's native resolution — its fixed logical coordinate space (16:9). The
// Scale Manager's FIT mode letterboxes/centers the canvas to fit the preview
// pane, shrinking it when the pane is smaller; the host page caps the container
// at this width (preview.html), so it is never scaled *above* native.
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const DEGREES_TO_RADIANS = Math.PI / 180;
const DEFAULT_ASSET_BASE = '/vendor/';

/** A drawn actor — a textured image or the fallback rectangle. */
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
    // Learner-uploaded textures as `{fileName: dataURL}`; an animation frame
    // references one by its file name (see projectAssets / UPLOADS.md).
    uploadedAssets: Record<string, string> = {},
  ) {
    const objects = new Map<Actor, GameObject>();
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    // The engine resolves each actor's current appearance frame; the driver just
    // draws it. An actor with a frame gets a textured Image; one without (no
    // appearance) gets the fallback rectangle. The Image's texture/cell is
    // refreshed every tick, so an animation's frames — same spritesheet, changing
    // cell — update in place.
    const create = (scene: Phaser.Scene, state: RenderState): GameObject =>
      state.frame && scene.textures.exists(state.frame.sprite)
        ? scene.add.image(state.x, state.y, state.frame.sprite)
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
        const frame = state.frame;
        if (frame && object instanceof Phaser.GameObjects.Image) {
          // A cell (spritesheet source rect) maps to a frame index in the
          // uniform strip; no cell ⇒ the whole single image.
          const index = frame.cell
            ? Math.round(frame.cell.x / frame.cell.width)
            : undefined;
          object.setTexture(frame.sprite, index);
          object.setPosition(
            state.x + frame.offset.x,
            state.y + frame.offset.y,
          );
          object.setScale(
            state.scaleX * frame.scale,
            state.scaleY * frame.scale,
          );
          object.setRotation(state.rotation * DEGREES_TO_RADIANS);
        } else {
          object.setPosition(state.x, state.y);
          object.setScale(state.scaleX, state.scaleY);
          object.setRotation(state.rotation * DEGREES_TO_RADIANS);
        }
      }
    };

    this.game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      },
      backgroundColor: '#101020',
      banner: false,
      audio: {noAudio: true},
      scene: {
        preload(this: Phaser.Scene) {
          for (const name of SPRITE_NAMES) {
            this.load.image(name, `${assetBase}sprites/${name}.png`);
          }
          for (const name of SPRITESHEET_NAMES) {
            this.load.spritesheet(name, `${assetBase}sprites/${name}.png`, {
              frameWidth: SPRITE_SIZE,
              frameHeight: SPRITE_SIZE,
            });
          }
          // Uploaded images, keyed by file name (data URLs — no network).
          for (const [name, dataUrl] of Object.entries(uploadedAssets)) {
            this.load.image(name, dataUrl);
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
