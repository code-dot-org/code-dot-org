import type p5 from 'p5';

import type {Sprite} from '../../sprites';

export interface Location {
  x: number;
  y: number;
}

/** A location, or a function the runtime calls for one (apps' location blocks). */
export type LocationInput = Location | (() => Location) | undefined | null;

/**
 * Picks sprites by id, by name, by costume (`'all'` for every sprite) or by
 * group (`''` for sprites in none), tried in that order.
 */
export interface SpriteArg {
  id?: number;
  name?: string;
  costume?: string;
  group?: string;
}

export interface TargetSet {
  follow: string[];
  avoid: string[];
}

/**
 * A sprite as the runtime keeps it: the library's sprite with the fields
 * `CoreLibrary.addSprite` and the commands assign (SPR-6, SPR-7).
 */
export interface RuntimeSprite extends Sprite {
  id: number;
  name?: string;
  group?: string;
  speed: number;
  direction: number;
  delay?: number;
  initialAngle?: number;
  dragging?: boolean;
  xOffset?: number;
  yOffset?: number;
  baseScale: number;
  setScale(scale: number): void;
  getScale(): number;
  glideTargets?: Location[];
  targetSet?: TargetSet;
  [prop: string]: unknown;
}

/** A background image, which the runtime labels with its name. */
export type BackgroundImage = p5.Image & {name?: string};

export type Background = string | BackgroundImage | undefined;

/** Arguments the runtime passes to an event's callback. */
export interface EventArgs {
  newSprite?: number;
  clickedSprite?: number;
  subjectSprite?: number;
  objectSprite?: number;
}

export type EventCallback = (args: EventArgs) => void;

/** A behavior's function runs once a frame for one sprite. */
export interface Behavior {
  func: (spriteArg: SpriteArg) => void;
  name: string;
}

export interface SpriteBehavior extends Behavior {
  sprite: RuntimeSprite;
}

/** The part of apps' JS-Interpreter wrapper the runtime reads. */
export interface WatchInterpreter {
  evaluateWatchExpression(expression: string): unknown;
}

/** What `CoreLibrary.addSprite` accepts. */
export interface SpriteOptions {
  name?: string;
  animation?: string;
  location?: LocationInput;
  group?: string;
  direction?: number;
  rotation?: number;
  speed?: number;
  lifetime?: number;
  delay?: number;
  initialAngle?: number;
  scale?: number;
  minimumScale?: number;
}

export type BubbleType = 'say' | 'think';

export interface SpeechBubble {
  id: string;
  sprite: RuntimeSprite;
  text: unknown;
  /** Unpaused world seconds at which the bubble goes, or null for never. */
  removeAt: number | null;
  /** The frame the bubble appeared in; validation reads it. */
  renderFrame: number;
  bubbleType: BubbleType;
}

export interface VariableBubble {
  label: string;
  /** The variable's name in the generated code. */
  name: string;
  location: Location;
}

export interface ForegroundEffect {
  id: string;
  name: string;
  renderFrame: number;
  func: () => void;
}

export interface ScreenText {
  title?: string;
  subtitle?: string;
}

/** Which touches a `whentouch` event has fired for, by sprite and target id. */
export type TouchMemory = Record<number, Record<number, {firedOnce?: boolean}>>;

export interface InputEventArgs {
  n?: number;
  unit?: string;
  key?: string;
  sprite?: SpriteArg;
  sprite1?: SpriteArg;
  sprite2?: SpriteArg;
  name?: string;
  costume?: string;
}

export interface InputEvent {
  type: string;
  args: InputEventArgs;
  callback: EventCallback;
  /** Per-event memory between frames; its meaning depends on `type`. */
  previous?: unknown;
  previousTime?: number;
  previousModdedTime?: number;
}

export interface PromptCallbacks {
  setterCallbacks: ((value: unknown) => void)[];
  userCallbacks: (() => void)[];
}

export interface Criterion {
  predicate: () => unknown;
  feedback?: string;
  complete: boolean;
}

export interface ValidationFrames {
  delay: number;
  fail: number;
  pass: number;
  successFrame: number;
}

export interface ValidationResult {
  state: 'failed' | 'succeeded';
  feedback: string | undefined;
}

/** A sprite as `storeStateAsPrevious` records it. */
export interface PreviousSprite {
  id: number;
  costume: string;
  x: number;
  y: number;
  behaviors: string[];
  tint: unknown;
  scale: number;
  speed: number;
  rotation: number;
  [prop: string]: unknown;
}

/** The last validated frame, for criteria that compare frames. */
export interface PreviousFrame {
  eventLogLength?: number;
  printLogLength?: number;
  soundLogLength?: number;
  foregroundEffectsLength?: number;
  background?: Background;
  screenText?: ScreenText;
  sprites?: PreviousSprite[];
  variableBubbles?: (VariableBubble & {value: unknown})[];
}
