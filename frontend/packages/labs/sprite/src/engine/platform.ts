// Sprite Lab 2's platform scenes: gravity, walls and players, the set-zoom
// camera, and character-set poses. This is the per-frame state
// SpriteLab2Engine kept on itself.
import type {PlayerObserver} from '../audioFeedback/playerObserver';
import {
  backgroundFrame,
  cameraFocus,
  clampZoom,
  type Point,
  stepZoom,
  worldPoint,
} from '../camera';
import {
  type AnimationPoses,
  isMoving,
  jumpFrame,
  nextFacing,
  pickPose,
  poseFrame,
  poseStartTick,
  posesByImageName,
  teeterTicks,
} from '../characterAnimations';
import {
  hasSupportAhead,
  isAtEdge,
  isSupported,
  type MovedPlayer,
  PATROLLER_WEIGHTLESS_GRAVITY,
  type PhysicsBox,
  PLATFORM_GRAVITY,
  resolvePlatformPhysics,
} from '../platformPhysics';
import type {RuntimeAnimationList} from '../types';

import type CoreLibrary from './runtime/CoreLibrary';
import type {RuntimeSprite, SpriteArg} from './runtime/types';

type View = {width: number; height: number};

type FootingTest = (
  sprite: RuntimeSprite,
  walls: PhysicsBox[],
  view: View,
  gravity: number,
) => boolean;

export class Platform {
  /** Whether the level uses platform physics at all (zGameDev). */
  readonly enabled: boolean;
  gravity = PLATFORM_GRAVITY;
  zoom = 1;
  zoomTarget = 1;
  /** Set when the zoomed loop has resolved physics this frame. */
  resolvedThisFrame = false;
  #observer: PlayerObserver | null = null;
  #prevBodies: RuntimeSprite[] = [];
  #walls: {frame: number; library: CoreLibrary; walls: RuntimeSprite[]} | null =
    null;
  #posesSource: RuntimeAnimationList | null = null;
  #posesByName = new Map<string, AnimationPoses>();

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  /** A fresh run: default gravity, zoom 1, and no memory of the player. */
  reset(): void {
    this.gravity = PLATFORM_GRAVITY;
    this.zoom = 1;
    this.zoomTarget = 1;
    this.#observer?.forget();
  }

  setGravity(value: unknown): void {
    this.gravity = Number(value) || 0;
  }

  setZoom(value: unknown): void {
    this.zoomTarget = clampZoom(Number(value));
  }

  setObserver(observer: PlayerObserver | null): void {
    this.#observer?.forget();
    this.#observer = observer;
  }

  /** Marked sprites keep a little pull at zero gravity, so patrollers settle. */
  bodyGravity(): number {
    return this.gravity === 0 ? PATROLLER_WEIGHTLESS_GRAVITY : this.gravity;
  }

  /** The walls, gathered once per frame and per library. */
  walls(library: CoreLibrary): RuntimeSprite[] {
    const frame = library.p5.frameCount;
    if (this.#walls?.frame !== frame || this.#walls.library !== library) {
      this.#walls = {
        frame,
        library,
        walls: library.getSpriteArray({group: 'walls'}),
      };
    }
    return this.#walls.walls;
  }

  /**
   * Whether any of the sprites has footing by `test`. Where nothing can
   * fall, outside platform physics or at zero gravity, every sprite does.
   */
  footing(library: CoreLibrary, spriteArg: SpriteArg, test: FootingTest) {
    if (!this.enabled) {
      return true;
    }
    const walls = this.walls(library);
    const view = viewOf(library);
    return library.getSpriteArray(spriteArg).some(sprite => {
      const gravity =
        sprite.group === 'players' ? this.gravity : this.bodyGravity();
      return gravity === 0 || test(sprite, walls, view, gravity);
    });
  }

  grounded(library: CoreLibrary, spriteArg: SpriteArg): boolean {
    return this.footing(library, spriteArg, isSupported);
  }

  supportAhead(
    library: CoreLibrary,
    spriteArg: SpriteArg,
    direction: number,
  ): boolean {
    return this.footing(library, spriteArg, (sprite, walls, view, gravity) =>
      hasSupportAhead(sprite, direction < 0 ? -1 : 1, walls, view, gravity),
    );
  }

  /** Jumps every player against gravity, if any player has footing. */
  jump(library: CoreLibrary, speed: unknown): void {
    if (this.gravity === 0 || !this.grounded(library, {group: 'players'})) {
      return;
    }
    const up = this.gravity < 0 ? 1 : -1;
    library.getSpriteArray({group: 'players'}).forEach(sprite => {
      sprite.velocity.y = up * Math.abs(Number(speed) || 0);
    });
  }

  /**
   * Platform physics for players and marked sprites, after this frame's
   * behaviors and events and before the paint.
   */
  resolve(library: CoreLibrary): void {
    if (!this.enabled) {
      return;
    }
    const snapshot = (sprite: RuntimeSprite): MovedPlayer => ({
      sprite,
      x: sprite.position.x,
      y: sprite.position.y,
    });
    const players: MovedPlayer[] = [];
    const bodies: MovedPlayer[] = [];
    Object.values(library.nativeSpriteMap).forEach(sprite => {
      // The mark lasts one frame; see usePlatformBody.
      const marked = sprite.__slab2Body;
      sprite.__slab2Body = false;
      if (sprite.group === 'players') {
        players.push(snapshot(sprite));
      } else if (marked) {
        bodies.push(snapshot(sprite));
      }
    });
    // A sprite no longer marked is an ordinary sprite again.
    this.#prevBodies.forEach(sprite => {
      if (
        !sprite.removed &&
        sprite.group !== 'players' &&
        !bodies.some(body => body.sprite === sprite)
      ) {
        sprite.mirrorY(1);
        sprite.velocity.y = 0;
      }
    });
    this.#prevBodies = bodies.map(body => body.sprite as RuntimeSprite);
    // Under upward gravity a sprite stands on the ceiling, drawn upside down.
    players.forEach(({sprite}) =>
      (sprite as RuntimeSprite).mirrorY(this.gravity < 0 ? -1 : 1),
    );
    const bodyUpright = this.bodyGravity() < 0 ? -1 : 1;
    bodies.forEach(({sprite}) =>
      (sprite as RuntimeSprite).mirrorY(bodyUpright),
    );
    // Other sprites keep the stock resolver.
    library.commands.collide.call(
      library,
      'collide',
      {group: ''},
      {group: 'walls'},
    );
    const walls = library.getSpriteArray({group: 'walls'});
    const view = viewOf(library);
    resolvePlatformPhysics(players, walls, view, this.gravity);
    if (bodies.length) {
      resolvePlatformPhysics(bodies, walls, view, this.bodyGravity());
    }
    this.#observe(players, walls, view);
  }

  // Only the first player is observed; the controls move every player alike.
  #observe(players: MovedPlayer[], walls: PhysicsBox[], view: View): void {
    const observer = this.#observer;
    if (!observer) {
      return;
    }
    if (!players.length) {
      observer.forget();
      return;
    }
    const {sprite, x: requestedX, y: requestedY} = players[0];
    observer.observe({
      sprite,
      requestedX,
      requestedY,
      gravity: this.gravity,
      walls,
      view,
    });
  }

  /**
   * ANI-41: a multi-frame sprite's natural size is its frame size, not the
   * pre-scaled size a frame change leaves behind.
   */
  unscaleSheetSprites(library: CoreLibrary): void {
    Object.values(library.nativeSpriteMap).forEach(sprite => {
      const animation = sprite.animation;
      if (animation && animation.images.length > 1) {
        sprite.setNaturalSize(animation.getWidth(), animation.getHeight());
      }
    });
  }

  /**
   * Character sets: a sprite wearing a set's sheet shows the frame for how
   * it moved this frame, facing the way it last moved (ANI-40). A player
   * that stops with its toes over a drop holds back from the edge for a
   * moment.
   */
  updateCharacters(library: CoreLibrary, list: RuntimeAnimationList): void {
    if (this.#posesSource !== list) {
      this.#posesSource = list;
      this.#posesByName = posesByImageName(list);
    }
    if (!this.#posesByName.size) {
      return;
    }
    const walls = this.walls(library);
    const view = viewOf(library);
    Object.values(library.nativeSpriteMap).forEach(sprite => {
      const poses = this.#posesByName.get(sprite.getAnimationLabel());
      const animation = sprite.animation;
      if (!poses || !animation) {
        return;
      }
      const state = (sprite.characterState ??= {
        x: sprite.position.x,
        facing: sprite.startFacing || 'right',
        key: null,
        tick: 0,
        moving: false,
        teetering: false,
      });
      const dx = sprite.position.x - state.x;
      state.x = sprite.position.x;
      state.facing = nextFacing(state.facing, dx);
      const moving = isMoving(dx);
      const player = this.enabled && sprite.group === 'players';
      const airborne =
        player && !isSupported(sprite, walls, view, this.gravity);
      if (moving || airborne) {
        state.teetering = false;
      } else if (
        state.moving &&
        player &&
        isAtEdge(
          sprite,
          walls,
          view,
          state.facing === 'right' ? 1 : -1,
          this.gravity,
        )
      ) {
        state.teetering = true;
      }
      state.moving = moving;
      const pick = pickPose(poses, {
        moving,
        airborne,
        teetering: state.teetering,
        facing: state.facing,
      });
      if (!pick) {
        return;
      }
      if (pick.key !== state.key) {
        state.key = pick.key;
        // A strip's walk starts mid-stride, so the first step shows at once.
        state.tick = poseStartTick(poses, pick);
      }
      sprite.mirrorX(pick.facing === state.facing ? 1 : -1);
      // The engine drives the frame; the animation must not advance itself.
      animation.stop();
      let frame: number;
      if (pick.pose === 'jump' && airborne) {
        frame =
          pick.range.start +
          Math.min(
            jumpFrame(sprite.velocity.y, this.gravity),
            pick.range.count - 1,
          );
      } else if (pick.pose === 'jump') {
        // Teetering: the falling frame, legs loose over the drop.
        frame = pick.range.start + pick.range.count - 1;
        if (state.tick + 1 >= teeterTicks(pick.range)) {
          state.teetering = false;
        }
      } else {
        frame = poseFrame(pick.range, state.tick);
        state.teetering = false;
      }
      animation.changeFrame(frame);
      state.tick++;
    });
  }

  /** Eases the zoom one frame toward its target and returns it. */
  stepZoom(): number {
    this.zoom = stepZoom(this.zoom, this.zoomTarget);
    return this.zoom;
  }

  /** The camera's focus at `zoom`: on the first player, kept in the world. */
  focus(library: CoreLibrary, zoom: number): Point {
    const player = library.getSpriteArray({group: 'players'})[0];
    return cameraFocus(zoom, player ? player.position : null);
  }

  /** The canvas mouse point in world coordinates under last frame's camera. */
  worldMouse(library: CoreLibrary, zoom: number): Point {
    const {World, camera} = library.p5;
    return worldPoint({x: World.mouseX, y: World.mouseY}, zoom, {
      x: camera.position.x,
      y: camera.position.y,
    });
  }

  backgroundFrame(zoom: number, focus: Point) {
    return backgroundFrame(zoom, focus);
  }
}

function viewOf(library: CoreLibrary): View {
  return {width: library.p5.width, height: library.p5.height};
}
