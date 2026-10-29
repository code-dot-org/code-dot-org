// The commands and overrides Sprite Lab 2 adds to each run's CoreLibrary,
// as SpriteLab2Engine.createLibrary did.
import type p5 from 'p5';

import {cameraFocus, type Point} from '../camera';
import {APP_HEIGHT, APP_WIDTH} from '../constants';
import {CONTACT_EPSILON} from '../platformPhysics';
import {cellSize, DEFAULT_SCENE_GRID_SIZE} from '../world';

import type {Platform} from './platform';
import type CoreLibrary from './runtime/CoreLibrary';
import type {SpriteArg, SpriteOptions} from './runtime/types';

// Default sprite size in a story scene on a platform level; platform
// scenes use one grid cell.
const STORY_SCENE_SPRITE_SIZE = 300;
// The position block's lanes, sized so a left and a right character share
// a scene, with feet near the story ground line.
const STORY_LANE_X: Record<string, number> = {
  left: 100,
  center: 200,
  right: 300,
};
const STORY_LANE_Y = 270;
const STORY_LANE_SPRITE_SIZE = STORY_SCENE_SPRITE_SIZE * 0.7;
// How much a platform scene dims its background: the alpha of a black fill.
const PLATFORM_BACKGROUND_DIM = 0.25;
// How long a restart quiets further restarts.
const RESTART_QUIET_MS = 1000;

/** What the library extensions need from the engine. */
export interface SceneHooks {
  readonly platform: Platform;
  isPlatformScene(): boolean;
  /** Whether the image is decoded and in the table. */
  hasImage(name: string): boolean;
  /** Whether the project has an image of that name, decoded or not. */
  projectHasImage(name: string): boolean;
  /** Decodes an image the scene's preload did not; false if there is none. */
  loadImageOnDemand(name: string): Promise<boolean>;
  notifyControlsChange(): void;
  /** Starts a scene jump after the delay; see SpriteLabEngine. */
  delaySceneJump(start: () => (() => void) | null | undefined): void;
  handlers: {
    goToScene: ((sceneId: string) => void) | null;
    goToExternalScene: ((sceneKey: string) => void) | null;
    restartScene: (() => void) | null;
    playMusic: ((channelId: string) => void) | null;
  };
  /** When the last restart jumped; it outlives a run's library. */
  lastRestartAt: number;
  /** Whether a caller waits for the next finished frame. */
  captureArmed(): boolean;
  /** Hands a finished frame to the waiting callers, if any. */
  frameDrawn(canvas: HTMLCanvasElement): void;
}

// A background copy sized to the canvas backing store, per image.
const displayBuffers = new WeakMap<p5.Image, p5.Image>();

export function extendLibrary(library: CoreLibrary, hooks: SceneHooks): void {
  const {platform} = hooks;
  const dimBackground = hooks.isPlatformScene();

  // Lab2's generated backgrounds outresolve the canvas: draw a copy sized to
  // the canvas backing, or, from the zoomed loop, into `frame` at full size.
  library.drawBackground = function (
    this: CoreLibrary,
    frame?: {x: number; y: number; size: number},
  ) {
    const {p5: p} = this;
    const background = this.background;
    p.background(typeof background === 'string' ? background : 'white');
    if (typeof background !== 'object') {
      return;
    }
    if (frame) {
      p.image(background, frame.x, frame.y, frame.size, frame.size);
    } else {
      const size = APP_WIDTH * (p.pixelDensity() || 1);
      let buffer = displayBuffers.get(background);
      if (!buffer || buffer.width !== size || buffer.height !== size) {
        // The shared image is never resized in place.
        buffer = background.get();
        buffer.resize(size, size);
        displayBuffers.set(background, buffer);
      }
      p.image(buffer, 0, 0, APP_WIDTH, APP_HEIGHT);
    }
    if (dimBackground) {
      p.push();
      p.noStroke();
      p.fill(0, 0, 0, 255 * PLATFORM_BACKGROUND_DIM);
      p.rect(0, 0, APP_WIDTH, APP_HEIGHT);
      p.pop();
    }
  } as CoreLibrary['drawBackground'];

  const {commands} = library;

  // A costume or background the scene's preload never saw (a name built at
  // runtime) applies once it decodes.
  const onDemand = <A extends unknown[]>(
    name: string,
    base: (this: CoreLibrary, ...args: A) => unknown,
    args: A,
  ) => {
    if (hooks.hasImage(name)) {
      return base.apply(library, args);
    }
    hooks.loadImageOnDemand(name).then(found => {
      if (found) {
        base.apply(library, args);
      }
    });
  };
  const baseSetAnimation = commands.setAnimation;
  commands.setAnimation = function (spriteArg: SpriteArg, animation: string) {
    return onDemand(animation, baseSetAnimation, [spriteArg, animation]);
  } as typeof commands.setAnimation;
  const baseSetBackgroundImageAs = commands.setBackgroundImageAs;
  commands.setBackgroundImageAs = function (imageName: string) {
    return onDemand(imageName, baseSetBackgroundImageAs, [imageName]);
  } as typeof commands.setBackgroundImageAs;

  if (platform.enabled) {
    // Sized per scene: a platformer's sprites fill one cell.
    library.defaultSpriteSize = hooks.isPlatformScene()
      ? cellSize(DEFAULT_SCENE_GRID_SIZE)
      : STORY_SCENE_SPRITE_SIZE;
    // Landings carry sub-pixel noise.
    library.contactEpsilon = CONTACT_EPSILON;
  }

  const extra = commands as unknown as Record<string, unknown>;
  extra.setPlatformGravity = (value: unknown) => {
    platform.setGravity(value);
    hooks.notifyControlsChange();
  };
  extra.setCameraZoom = (value: unknown) => platform.setZoom(value);

  if (platform.enabled) {
    commands.executeDrawLoopAndCallbacks = zoomedDrawLoop(hooks);
  }
  // Captured frames are finished ones: every pass drawn.
  const drawLoop = commands.executeDrawLoopAndCallbacks;
  commands.executeDrawLoopAndCallbacks = function (this: CoreLibrary) {
    drawLoop.call(this);
    hooks.frameDrawn(
      (this.p5.drawingContext as CanvasRenderingContext2D).canvas,
    );
  };

  // Story lanes: placement by name; the right lane faces its partner.
  extra.makeSpriteAtPosition = (animation: string, position: string) => {
    const x = STORY_LANE_X[position] ?? STORY_LANE_X.center;
    const id = library.addSprite({
      animation,
      location: {x, y: STORY_LANE_Y},
      scale: STORY_LANE_SPRITE_SIZE,
    });
    if (position === 'right' && id !== undefined) {
      library.getSpriteArray({id}).forEach(sprite => {
        sprite.mirrorX(-1);
        sprite.startFacing = 'left';
      });
    }
    return id;
  };
  extra.setPlatformPlayer = (spriteArg: SpriteArg) => {
    library.getSpriteArray(spriteArg).forEach(sprite => {
      sprite.group = 'players';
    });
  };
  extra.platformJump = (speed: unknown) => platform.jump(library, speed);
  // A behavior that wants gravity marks its sprite for one frame.
  extra.usePlatformBody = (spriteArg: SpriteArg) => {
    library.getSpriteArray(spriteArg).forEach(sprite => {
      sprite.__slab2Body = true;
    });
  };
  extra.platformGravity = () => platform.gravity;
  extra.platformGrounded = (spriteArg: SpriteArg) =>
    platform.grounded(library, spriteArg);
  extra.platformSupportAhead = (spriteArg: SpriteArg, direction: number) =>
    platform.supportAhead(library, spriteArg, direction);
  extra.playMusic = (channelId: unknown) => {
    if (channelId && hooks.handlers.playMusic) {
      hooks.handlers.playMusic(String(channelId));
    }
  };

  // A costume the project lacks is skipped, with one warning, where the
  // library would throw and stop the program. One the scene's preload
  // skipped is known, and decodes on demand.
  const knownCostume = (name: string | undefined) =>
    !!name && hooks.projectHasImage(name);
  const warned = new Set<string | undefined>();
  const warnMissing = (name: string | undefined) => {
    if (warned.has(name)) {
      return;
    }
    warned.add(name);
    console.warn(
      name
        ? `SpriteLab2: no image named ${JSON.stringify(name)} in this project; the block asking for it does nothing.`
        : 'SpriteLab2: a block has no image chosen; it does nothing.',
    );
  };
  const addSprite = library.addSprite.bind(library);
  // A new sprite needs its costume decoded now; the library throws on one
  // that is not.
  library.addSprite = (opts?: SpriteOptions | null) => {
    if (opts?.animation && !hooks.hasImage(opts.animation)) {
      warnMissing(opts.animation);
      return undefined;
    }
    return addSprite(opts);
  };
  const guardedSetAnimation = commands.setAnimation;
  commands.setAnimation = function (
    this: CoreLibrary,
    spriteArg: SpriteArg,
    animation: string,
  ) {
    if (!knownCostume(animation)) {
      warnMissing(animation);
      return;
    }
    return guardedSetAnimation.call(this, spriteArg, animation);
  } as typeof commands.setAnimation;

  extra.goToScene = (sceneId: unknown) => {
    hooks.delaySceneJump(() => {
      const handler = hooks.handlers.goToScene;
      return handler && (() => handler(String(sceneId)));
    });
  };
  // The quiet window keeps a condition that still holds next frame from
  // restarting at frame rate. It runs from the jump, not the trigger.
  extra.restartScene = () => {
    if (Date.now() - hooks.lastRestartAt < RESTART_QUIET_MS) {
      return;
    }
    hooks.delaySceneJump(() => {
      const handler = hooks.handlers.restartScene;
      return (
        handler &&
        (() => {
          hooks.lastRestartAt = Date.now();
          handler();
        })
      );
    });
  };
  extra.goToExternalScene = (sceneKey: unknown) => {
    hooks.delaySceneJump(() => {
      const handler = hooks.handlers.goToExternalScene;
      return handler && (() => handler(String(sceneKey)));
    });
  };
}

type Frame = {x: number; y: number; size: number};

/**
 * CoreLibrary's draw loop with the set-zoom camera (platform levels). Zoom
 * is render-only: sprites keep world coordinates. The background is drawn
 * in screen space at its own zoom, then sprites and speech bubbles through
 * the camera, then variable bubbles, effects and titles in screen space.
 */
function zoomedDrawLoop(hooks: SceneHooks) {
  const {platform} = hooks;
  return function (this: CoreLibrary): void {
    const {camera} = this.p5;
    const zoom = platform.stepZoom();
    // The sprite library's own mouse translation ignores zoom.
    const mouse = platform.worldMouse(this, zoom);
    camera.mouseX = mouse.x;
    camera.mouseY = mouse.y;
    this.runBehaviors();
    this.runEvents();
    // Resolve before framing, so the shot is on where sprites end up.
    platform.resolve(this);
    platform.resolvedThisFrame = true;
    const focus = platform.focus(this, zoom);
    if (hooks.captureArmed()) {
      // The picture shows the whole world at zoom 1; the real frame below
      // paints over it.
      drawWorld(this, platform, 1, cameraFocus(1, null));
      hooks.frameDrawn(
        (this.p5.drawingContext as CanvasRenderingContext2D).canvas,
      );
    }
    drawWorld(this, platform, zoom, focus);
    this.drawVariableBubbles();
    if (!this.isPreviewFrame()) {
      this.foregroundEffects.forEach(effect => effect.func());
    }
    if (this.screenText.title || this.screenText.subtitle) {
      this.commands.drawTitle.apply(this);
    }
    this.commands.drawStoryLabText.apply(this);
  };
}

/** Background, sprites and speech bubbles through the camera. */
function drawWorld(
  library: CoreLibrary,
  platform: Platform,
  zoom: number,
  focus: Point,
): void {
  const {camera} = library.p5;
  camera.off();
  (library.drawBackground as (frame?: Frame) => void).call(
    library,
    platform.backgroundFrame(zoom, focus),
  );
  camera.zoom = zoom;
  camera.position.x = focus.x;
  camera.position.y = focus.y;
  camera.on();
  library.p5.drawSprites();
  library.drawSpeechBubbles();
  camera.off();
}
