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
// an actor with no appearance. Phaser is a renderer, not the animator. Every
// texture comes from the project itself (`projectAssets`), loaded as a plain
// image; a frame's cell rectangle becomes a named texture frame on first use.
//
// Renderer: WebGL. The game runs on `Phaser.WEBGL` outright rather than `AUTO`,
// because Effects (specs/EFFECTS_PLAN.md) are compiled GLSL registered as filter
// render nodes, and `renderer.renderNodes` exists only on the WebGL renderer. A
// browser that cannot give us WebGL is told so at boot (`assertWebGL`), not at
// the first effect.
//
// Input: DOM key listeners on the focusable `#game` parent keep a live set of
// held keys (by name — every key, not just arrows), handed to the World each
// frame (`setInput`) before ticking, so the Input rule can move controlled actors
// and raise its key-pressed/released events. Listening on `#game` (not the window)
// with `autoFocus` off means the game responds to keys only while the learner has
// focused it (click or tab) — and a hot restart never steals focus back from the
// editor. preview.html rings `#game` while it is focused.

import Phaser from 'phaser';

import type {Actor, RenderState, World} from 'world-lab';

import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../viewport';

import {EffectRegistry, type EffectErrorReporter} from './effects';
import {installSkewHook, type RenderStepInternals} from './skew';

const ACTOR_SIZE = 24;
// The game's native resolution — its fixed logical coordinate space, shared with
// the map editor (runtime/viewport). The Scale Manager's FIT mode
// letterboxes/centers the canvas to fit the preview pane, shrinking it when the
// pane is smaller; the host page caps the container at this width
// (preview.html), so it is never scaled *above* native.
const GAME_WIDTH = VIEWPORT_WIDTH;
const GAME_HEIGHT = VIEWPORT_HEIGHT;
const DEGREES_TO_RADIANS = Math.PI / 180;

/**
 * The name of a texture frame for `cell`, registering it on first use.
 *
 * Phaser reads a sub-rectangle of an image through a named frame, which a
 * spritesheet load would normally create up front from a fixed cell size. There
 * is no fixed cell size here — an animation's frames carry their own rectangles,
 * and the image they read is just an image — so each rectangle becomes a frame
 * the first time it is drawn, named by the rectangle itself.
 */
function cellFrame(
  scene: Phaser.Scene,
  sprite: string,
  cell: {x: number; y: number; width: number; height: number},
): string {
  const name = `${cell.x},${cell.y},${cell.width},${cell.height}`;
  const texture = scene.textures.get(sprite);
  if (texture && !texture.has(name)) {
    texture.add(name, 0, cell.x, cell.y, cell.width, cell.height);
  }
  return name;
}

/** A drawn actor — a textured image or the fallback rectangle. */
type GameObject = Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

/**
 * Fail at boot, with a sentence, rather than at the first effect with a stack.
 *
 * The game asks for `Phaser.WEBGL` outright (not `AUTO`): an effect is a
 * compiled GLSL shader and has no canvas fallback, so a game silently downgraded
 * to Canvas would boot fine and then throw from inside the driver the moment an
 * actor used one. The preview surface catches this and reports it as an engine
 * error, which is where a learner will actually see it.
 */
function assertWebGL(): void {
  const probe = document.createElement('canvas');
  const gl =
    probe.getContext('webgl') ?? probe.getContext('experimental-webgl');
  if (!gl) {
    throw new Error(
      'This browser cannot run WebGL, which the world preview needs to draw.',
    );
  }
  // Contexts are a scarce per-page resource; hand this one back immediately.
  (gl as WebGLRenderingContext)
    .getExtension('WEBGL_lose_context')
    ?.loseContext();
}

/**
 * Where a throw out of the learner's own code goes.
 *
 * Separate from {@link EffectErrorReporter} because they are different failures
 * with different remedies: an effect that will not compile leaves the game
 * running without it, while a body that throws stops the simulation.
 */
export type RuntimeErrorReporter = (message: string, stack?: string) => void;

// Keys whose browser default (scrolling the page) we suppress while the game
// has focus, so arrows/space drive the game instead of the page.
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  ' ',
]);

export class PhaserBinding {
  private readonly game: Phaser.Game;
  private readonly parent: HTMLElement;
  /** Set by the first throw out of the learner's code; nothing ticks after. */
  private halted = false;
  private readonly focusOnPointerDown: () => void;
  // Broad keyboard capture: DOM listeners on the (focusable) `#game` parent keep
  // a live set of pressed DOM key names. Attached to the parent — not window — so
  // keys only register while the game is focused, and removed in stop().
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private readonly onKeyUp: (event: KeyboardEvent) => void;
  private readonly onBlur: () => void;

  constructor(
    world: World,
    parent: HTMLElement,
    // The project's textures as `{fileName: dataURL}`; an animation frame
    // references one by its file name (see projectAssets / UPLOADS.md). There
    // is no other source: a game draws what its project holds.
    projectAssets: Record<string, string> = {},
    // Where an effect that will not compile is reported. It happens inside the
    // render loop — long after the constructor's caller could have caught it —
    // so the message needs a way out that is not a throw.
    onEffectError: EffectErrorReporter = () => {},
    // Where a throw from the learner's own code is reported. Same reason: the
    // simulation runs inside Phaser's loop, so an error in a rule's step body
    // has no caller left to catch it.
    onRuntimeError: RuntimeErrorReporter = () => {},
  ) {
    const objects = new Map<Actor, GameObject>();
    // Every DOM key currently held (by `KeyboardEvent.key` name); fed to the
    // engine each frame. `update` reads it; the listeners below keep it current.
    const downKeys = new Set<string>();

    /**
     * Run a frame's worth of simulation, and stop simulating if it throws.
     *
     * A rule's step body is the learner's code, called from Phaser's loop. A
     * throw there — a query that no longer exists, a property read off nothing —
     * escapes into `requestAnimationFrame`, where nobody catches it, and comes
     * back on the very next frame: sixty identical errors a second, none of them
     * in the lab's console, and a game that is on screen but no longer running.
     *
     * So the first one is reported and the simulation halts. The canvas stays
     * (an empty pane says less than a frozen one), the scene keeps drawing the
     * last good frame, and the next build restarts everything.
     */
    const guard = (frame: () => void): void => {
      if (this.halted) {
        return;
      }
      try {
        frame();
      } catch (error) {
        this.halted = true;
        onRuntimeError(
          error instanceof Error ? error.message : String(error),
          error instanceof Error ? error.stack : undefined,
        );
      }
    };

    // Vertical skew (positional.skew) is a shear Phaser's transform pipeline does
    // not model natively (its per-object matrix is position·rotation·scale only).
    // `installSkewHook` (./skew) wraps each object's WebGL render function so its
    // renderer receives M = T(c)·shear·T(-c) — a shear about the actor's center c
    // — as the parent matrix it would otherwise not have. This module owns the
    // matrices: each skewed object has one, rebuilt every frame in `sync`; an
    // unskewed one has no entry and renders through the normal path.
    // Compiled shaders for this game, keyed by effect path. It lives as long as
    // the binding does: a restart builds a new renderer, and render nodes
    // registered with the old one mean nothing to it.
    const effectRegistry = new EffectRegistry(Phaser, onEffectError);

    const skewMatrices = new WeakMap<
      GameObject,
      Phaser.GameObjects.Components.TransformMatrix
    >();
    const shear = new Phaser.GameObjects.Components.TransformMatrix();
    // Build (or clear) an object's shear matrix M = T(c)·shear·T(-c) about its
    // drawn center c; the render hook feeds M to the object's WebGL renderer.
    const applySkew = (
      object: GameObject,
      cx: number,
      cy: number,
      degrees: number,
    ) => {
      if (!degrees) {
        skewMatrices.delete(object);
        return;
      }
      let matrix = skewMatrices.get(object);
      if (!matrix) {
        matrix = new Phaser.GameObjects.Components.TransformMatrix();
        skewMatrices.set(object, matrix);
      }
      const b = Math.tan(degrees * DEGREES_TO_RADIANS);
      matrix.applyITRS(cx, cy, 0, 1, 1); // T(center)
      matrix.multiply(shear.setTransform(1, b, 0, 1, 0, 0)); // ·shear
      matrix.translate(-cx, -cy); // ·T(-center)
    };

    // The engine resolves each actor's current appearance frame; the driver just
    // draws it. An actor with a frame gets a textured Image; one without (no
    // appearance) gets the fallback rectangle. The Image's texture/cell is
    // refreshed every tick, so an animation's frames — same spritesheet, changing
    // cell — update in place.
    const create = (scene: Phaser.Scene, state: RenderState): GameObject => {
      const object =
        state.frame && scene.textures.exists(state.frame.sprite)
          ? scene.add.image(state.x, state.y, state.frame.sprite)
          : // The appearance-less fallback: a plain rectangle placeholder.
            scene.add.rectangle(
              state.x,
              state.y,
              ACTOR_SIZE,
              ACTOR_SIZE,
              0x33cc66,
            );
      // Give either object kind a skew-aware render hook up front; it is a no-op
      // cost until the actor actually carries a non-zero skew.
      installSkewHook(object as unknown as RenderStepInternals, () =>
        skewMatrices.get(object),
      );
      return object;
    };

    const sync = (scene: Phaser.Scene) => {
      // Viewport-wide effects, applied to the camera rather than to any one
      // object — everything it has drawn gets filtered. Reconciled each frame
      // like an actor's, so a world effect can be added and removed while the
      // game runs.
      effectRegistry.reconcileCamera(
        scene,
        scene.cameras.main,
        world.effects(),
      );

      for (const state of world.renderSnapshot() as RenderState[]) {
        let object = objects.get(state.actor);
        if (!object) {
          object = create(scene, state);
          objects.set(state.actor, object);
        }
        // Effects are reconciled every frame, not applied once at creation: an
        // event handler can add or remove one while the game runs, and the
        // engine's list is re-read here each tick. `reconcile` attaches only
        // what is new and detaches what is gone (attaching twice would stack a
        // second filter), and returns immediately for the common case of an
        // actor with no effects.
        effectRegistry.reconcile(scene, object, state.effects);

        const frame = state.frame;
        if (frame && object instanceof Phaser.GameObjects.Image) {
          // A cell is a source rectangle in the image, named and registered on
          // the texture the first time it is drawn (`cellFrame`); no cell ⇒ the
          // whole image. Every texture is loaded as a plain image, so a
          // spritesheet is not a kind of asset here — it is an image that some
          // animation happens to read rectangles out of.
          object.setTexture(
            frame.sprite,
            frame.cell ? cellFrame(scene, frame.sprite, frame.cell) : undefined,
          );
          object.setPosition(
            state.x + frame.offset.x,
            state.y + frame.offset.y,
          );
          object.setScale(
            state.scaleX * frame.scale,
            state.scaleY * frame.scale,
          );
          object.setRotation(state.rotation * DEGREES_TO_RADIANS);
          // Shear about the drawn center (position plus the frame's offset).
          applySkew(
            object,
            state.x + frame.offset.x,
            state.y + frame.offset.y,
            state.skew,
          );
        } else {
          object.setPosition(state.x, state.y);
          object.setScale(state.scaleX, state.scaleY);
          object.setRotation(state.rotation * DEGREES_TO_RADIANS);
          // The rectangle is centered on its position; shear about that point.
          applySkew(object, state.x, state.y, state.skew);
        }
      }
    };

    // The game must never steal focus: it runs in the preview iframe, and Phaser's
    // default `autoFocus` calls window.focus() on every boot — so each hot restart
    // would yank focus out of the editor mid-edit. With it off, the game only takes
    // focus when the learner clicks/tabs to it (parent is a focusable `#game`, see
    // preview.html), and its keyboard listens on that element, so keys reach the
    // game only while it is focused.
    parent.tabIndex = parent.tabIndex < 0 ? 0 : parent.tabIndex;
    // Focus the game on click. Phaser preventDefaults the canvas pointerdown, which
    // suppresses the browser's focus-on-click, so we focus the parent ourselves —
    // a click starts play by routing the keyboard to the game, and the focus ring
    // (preview.html) then signals it. Removed in stop() so a hot restart doesn't
    // stack listeners.
    this.parent = parent;
    this.focusOnPointerDown = () => parent.focus();
    parent.addEventListener('pointerdown', this.focusOnPointerDown);
    // Read the keyboard ourselves (Phaser's keyboard is disabled below): capture
    // every key by DOM name into `downKeys` while `#game` is focused.
    this.onKeyDown = (event: KeyboardEvent) => {
      downKeys.add(event.key);
      if (SCROLL_KEYS.has(event.key)) {
        event.preventDefault();
      }
    };
    this.onKeyUp = (event: KeyboardEvent) => downKeys.delete(event.key);
    // A blur mid-press never sees the keyup; clear so keys don't stick down.
    this.onBlur = () => downKeys.clear();
    parent.addEventListener('keydown', this.onKeyDown);
    parent.addEventListener('keyup', this.onKeyUp);
    parent.addEventListener('blur', this.onBlur);
    assertWebGL();
    this.game = new Phaser.Game({
      // WebGL, not AUTO — see assertWebGL. Effects are compiled GLSL shaders
      // registered as Phaser filter render nodes, and `renderNodes` exists only
      // on the WebGL renderer.
      type: Phaser.WEBGL,
      parent,
      autoFocus: false,
      // Keyboard comes from the DOM listeners above (all keys); Phaser's own
      // keyboard input is off so it neither double-handles nor preventDefaults.
      input: {keyboard: false},
      scale: {
        // FIT sizes the canvas to the (CSS-sized, exactly 16:9) `#game` box, so
        // its scale — and thus input mapping — stays correct. No autoCenter: CSS
        // already centers `#game`, and CENTER_BOTH would measure the parent and
        // apply a margin to the canvas on every (re)load.
        mode: Phaser.Scale.FIT,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      },
      backgroundColor: '#101020',
      banner: false,
      audio: {noAudio: true},
      scene: {
        preload(this: Phaser.Scene) {
          // The project's own images, keyed by file name (data URLs — no
          // network, and nothing built in: an image a game draws is a file the
          // project holds, whether the learner drew it or imported it).
          for (const [name, dataUrl] of Object.entries(projectAssets)) {
            this.load.image(name, dataUrl);
          }
        },
        create(this: Phaser.Scene) {
          guard(() => sync(this));
        },
        update(this: Phaser.Scene, _time: number, delta: number) {
          guard(() => {
            // Feed this frame's held keys in before advancing the simulation.
            world.setInput(downKeys);
            // Phaser's delta is milliseconds; the engine ticks in seconds.
            world.tick(delta / 1000);
            sync(this);
          });
        },
      },
    });
  }

  /**
   * Tear the game down: stops the loop and releases the canvas.
   *
   * Never throws, and never returns with a canvas still in the pane. Both
   * matter because the caller stops a game in order to start another one: a
   * `destroy` that throws (which a game whose scene died mid-`create` can do)
   * used to abandon the teardown, leaving the dead canvas in the DOM and the
   * new game's canvas stacked on top of it — the "phantom canvas" a learner
   * sees after a crash.
   */
  stop(): void {
    this.halted = true;
    const forgive = (step: () => void) => {
      try {
        step();
      } catch {
        // Whatever is left is being thrown away; the sweep below is what has
        // to happen either way.
      }
    };
    forgive(() =>
      this.parent.removeEventListener('pointerdown', this.focusOnPointerDown),
    );
    forgive(() => this.parent.removeEventListener('keydown', this.onKeyDown));
    forgive(() => this.parent.removeEventListener('keyup', this.onKeyUp));
    forgive(() => this.parent.removeEventListener('blur', this.onBlur));
    forgive(() => this.game.destroy(true));
    // Phaser removes its own canvas on a clean destroy; this is for the other
    // case. Anything still under the pane belongs to a game that is gone.
    for (const canvas of [...this.parent.querySelectorAll('canvas')]) {
      canvas.remove();
    }
  }
}
