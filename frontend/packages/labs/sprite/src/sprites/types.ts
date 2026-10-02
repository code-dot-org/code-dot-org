import type p5 from 'p5';

import type {Animation, FrameRecord, SpriteSheet} from './animation';
import type {Camera} from './camera';
import type {CollisionMembers} from './collision';
import type {Group} from './Group';
import type {InputMembers} from './input';
import type {Sprite} from './Sprite';
import type {World} from './World';

/** An entry of the predefined-animation table (SPR-30, ANI-27). */
export type PredefinedAnimation = p5.Image | Animation;

/** What the library adds to an attached instance (LIF-2). */
export interface SpriteMembers extends InputMembers, CollisionMembers {
  createSprite(x?: number, y?: number, width?: number, height?: number): Sprite;
  readonly allSprites: Group;
  Group: new () => Group;
  createGroup(): Group;
  readonly World: World;
  drawSprites(group?: Group): void;
  drawSprite(sprite?: Sprite): void;
  createEdgeSprites(): Group;
  edges: Group | undefined;
  leftEdge?: Sprite;
  rightEdge?: Sprite;
  topEdge?: Sprite;
  bottomEdge?: Sprite;
  camera: Camera;
  Camera: new (x: number, y: number, zoom: number) => Camera;
  Animation: typeof Animation;
  SpriteSheet: typeof SpriteSheet;
  loadAnimation(sheet: SpriteSheet): Animation;
  loadAnimation(...images: p5.Image[]): Animation;
  loadSpriteSheet(
    image: p5.Image,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
  ): SpriteSheet;
  loadSpriteSheet(image: p5.Image, frames: FrameRecord[]): SpriteSheet;
  rgb(r: number, g: number, b: number, a?: number): p5.Color;
  /** The predefined-animation table, keyed by costume name. */
  predefinedAnimations: Record<string, PredefinedAnimation> | undefined;
  /** When true, `setAnimation` stops the new animation's playback. */
  pauseAnimationsByDefault: boolean;
  /** Wall-clock milliseconds at attachment (LIF-5). */
  readonly worldStartTime: number;
}

/** A p5 instance with the sprite library attached. */
export type SpriteP5 = Omit<p5, 'camera'> & SpriteMembers;
