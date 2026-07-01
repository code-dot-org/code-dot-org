declare namespace Phaser {
  const AUTO: number;

  interface GameConfig {
    forceSetTimeOut?: boolean;
    width?: number;
    height?: number;
    renderer?: number;
    parent?: string;
    state?: string;
    preserveDrawingBuffer?: boolean;
  }

  class Game {
    constructor(config: GameConfig);
    state: StateManager;
    load: Loader;
    time: Time;
    stage: Stage;
    add: GameObjectFactory;
    tweens: TweenManager;
    input: Input;
    world: World;
    rnd: RandomDataGenerator;
    cache: Cache;
    camera: Camera;
    physics: Physics;
  }

  interface StateManager {
    add(key: string, state: unknown): void;
    start(key: string): void;
  }

  interface Loader {
    resetLocked: boolean;
    image(key: string, url: string): void;
    atlasJSONHash(key: string, pngUrl: string, jsonUrl: string): void;
    audio(key: string, urls: string[]): void;
    onLoadComplete: Signal;
    start(): void;
  }

  interface Time {
    advancedTiming: boolean;
    slowMotion: number;
    fps: number;
  }

  interface Stage {
    disableVisibilityChange: boolean;
    backgroundColor: string | number;
  }

  interface GameObjectFactory {
    group(): Group;
    sprite(x: number, y: number, key: string, frame?: string): Sprite;
    tween(target: unknown): Tween;
    audio(key: string): Sound;
    text(x: number, y: number, text: string, style?: unknown): Text;
    bitmapData(width: number, height: number): BitmapData;
  }

  interface Group {
    create(x: number, y: number, key: string, frame?: string): Sprite;
    add(child: unknown): unknown;
    sort(key: string, order?: number): void;
    removeAll(destroy?: boolean, silent?: boolean): void;
  }

  interface Sprite {
    x: number;
    y: number;
    frame: string | number;
    alpha: number;
    visible: boolean;
    tint: number;
    sortOrder: number;
    animations: AnimationManager;
    anchor: Point;
    scale: Point;
    width: number;
    height: number;
    kill(): void;
    destroy(): void;
  }

  interface AnimationManager {
    add(name: string, frames: string[], frameRate?: number, loop?: boolean): Animation;
    play(name: string, frameRate?: number, loop?: boolean): Animation;
    stop(name?: string, resetFrame?: boolean): void;
    getAnimation(name: string): Animation;
  }

  interface Animation {
    onComplete: Signal;
  }

  interface Tween {
    to(properties: unknown, duration: number, ease?: unknown, autoStart?: boolean, delay?: number, repeat?: number, yoyo?: boolean): Tween;
    onComplete: Signal;
    start(): Tween;
    stop(): void;
    isPaused: boolean;
    isRunning: boolean;
    pause(): void;
    resume(): void;
    timeScale: number;
  }

  interface TweenManager {
    removeAll(): void;
  }

  interface Signal {
    add(callback: (...args: unknown[]) => void, context?: unknown): void;
    addOnce(callback: (...args: unknown[]) => void, context?: unknown): void;
  }

  interface Point {
    x: number;
    y: number;
    set(x: number, y?: number): void;
    setTo(x: number, y?: number): void;
  }

  interface Sound {
    play(marker?: string, position?: number, volume?: number, loop?: boolean): void;
    stop(): void;
  }

  interface Text {
    text: string;
    x: number;
    y: number;
    visible: boolean;
    destroy(): void;
  }

  interface BitmapData {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    clear(): void;
  }

  interface Input {
    keyboard: Keyboard;
  }

  interface Keyboard {
    addKey(key: number): Key;
    isDown(key: number): boolean;
  }

  interface Key {
    onDown: Signal;
    isDown: boolean;
  }

  interface World {
    setBounds(x: number, y: number, width: number, height: number): void;
  }

  interface RandomDataGenerator {
    integerInRange(min: number, max: number): number;
  }

  interface Cache {
    getFrameData(key: string): FrameData;
  }

  interface FrameData {
    getFrameByName(name: string): Frame;
    getFrames(): Frame[];
  }

  interface Frame {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface Camera {
    x: number;
    y: number;
  }

  interface Physics {
    startSystem(system: number): void;
    arcade: ArcadePhysics;
  }

  interface ArcadePhysics {
    enable(sprite: Sprite): void;
  }

  namespace Timer {
    const SECOND: number;
  }

  namespace Easing {
    namespace Linear {
      const None: unknown;
    }
    namespace Quadratic {
      const In: unknown;
      const Out: unknown;
      const InOut: unknown;
    }
    namespace Cubic {
      const In: unknown;
      const Out: unknown;
      const InOut: unknown;
    }
    namespace Sinusoidal {
      const In: unknown;
      const Out: unknown;
      const InOut: unknown;
    }
  }

  namespace Keyboard {
    const UP: number;
    const DOWN: number;
    const LEFT: number;
    const RIGHT: number;
    const SPACEBAR: number;
  }

  const GROUP_SORT_INDEX: number;
}

declare namespace PIXI {
  let canUseNewCanvasBlendModes: (() => boolean) | undefined;
}

interface Window {
  PhaserGlobal?: Record<string, unknown>;
  PIXI?: typeof PIXI;
  Phaser?: typeof Phaser;
}
