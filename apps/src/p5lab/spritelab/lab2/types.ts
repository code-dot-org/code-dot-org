import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {BlocklyLevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import {RGBA} from '@cdo/apps/pixelEditor/tools';

import {ImageGenerationMetadata} from './ai/images/types';
import {AnimationPoses} from './characterAnimations';
import {LevelMode} from './levelMode';
import {Tab} from './redux/spriteLab2Redux';
import {World} from './world';

/** The animation-list category marking an image as a background, not a costume. */
export const BACKGROUNDS_CATEGORY = 'backgrounds';
/** The category marking an image as a square tile for platform pieces. */
export const BLOCKS_CATEGORY = 'blocks';

// The serializable subset of a Sprite Lab animation, mirroring the JSDoc
// `SerializedAnimationProps` typedef in p5lab/shapes.js (which is plain JS, so
// not importable as a TS type).
export interface SerializedAnimationProps {
  name: string;
  sourceUrl?: string;
  frameSize: {x: number; y: number};
  frameCount: number;
  looping: boolean;
  frameDelay: number;
  version?: string;
  categories?: string[];
  /** Physical pixels per art pixel; absent on non-pixel-art animations. */
  pixelGridSize?: number;
  /** Pixel-editor recently-used colors, in first-seen order. */
  recentColors?: RGBA[];
  /** The stored image is already cropped to its content. */
  trimmed?: boolean;
  /** Present on AI-generated images. */
  generation?: ImageGenerationMetadata;
  /** Present on a character set: where each pose lives in the sheet. */
  poses?: AnimationPoses;
}

// Mirrors the JSDoc `SerializedAnimationList` typedef in p5lab/shapes.js.
export interface SerializedAnimationList {
  orderedKeys: string[];
  propsByKey: {[key: string]: SerializedAnimationProps};
}

// In-memory animation props (JSDoc `AnimationProps`): serialized props plus
// the loaded image. dataURI is stripped on save.
export interface RuntimeAnimationProps extends SerializedAnimationProps {
  dataURI?: string;
}

export interface RuntimeAnimationList {
  orderedKeys: string[];
  propsByKey: {[key: string]: RuntimeAnimationProps};
}

/** What a scene is for: the blocks it offers and how big its sprites are. */
export type SceneType = 'story' | 'platform';

/**
 * A named code workspace. The id is the source of truth, being what the
 * go-to-scene block stores; scenes[0] is where Play starts.
 */
export interface Scene {
  id: string;
  name: string;
  /** Absent on scenes created before scene types. */
  type?: SceneType;
  /** This scene's Blockly workspace serialization. */
  source?: WorkspaceSerialization;
  /** Starter sprite and block placements, spawned ahead of the program. */
  world?: World;
}

/** The single ProjectSources.source JSON for a SpriteLab2 project. */
export interface Sources extends ProjectSources {
  /** Costumes and backgrounds, in the classic animationList shape. */
  animations?: SerializedAnimationList;
  /** Per-scene code workspaces. */
  scenes?: Scene[];
}

/**
 * One stage of a level's floating-guide instructions. `text` is markdown;
 * `after` is what must hold to reach this step from the one before it, every
 * listed clause of it (the first step needs none).
 */
export interface GuideStep {
  text: string;
  /** Offer the Continue button to the next level while on this step. */
  showContinue?: boolean;
  /**
   * Image counts are measured from what the project held when the level
   * opened, so a level gates on the images made on it, not the ones it
   * inherited from earlier levels.
   */
  after?: {
    /** At least this many block-kind cells placed in the World. */
    worldBlocks?: number;
    /** At least this many sprite-kind cells placed in the World. */
    worldSprites?: number;
    /** At least this many images made on this level. */
    images?: number;
    /** At least this many sprite-type images made on this level. */
    spriteImages?: number;
    /** At least this many background-type images made on this level. */
    backgroundImages?: number;
    /** At least this many block-type images made on this level. */
    blockImages?: number;
    /** This tab is active. */
    tab?: Tab;
  };
}

export interface SpriteLab2LevelProperties extends BlocklyLevelProperties {
  /** What kind of level this is; decides the tabs and the image controls. */
  levelMode?: LevelMode;
  /** The one scene this level edits, created on first load if the project
      lacks it. The id is the key the go-to-scene block stores; the name is
      what the student sees, applied only at creation. The id must not be
      'scene-1' (the id synthesized for sources saved before scenes). */
  pinnedScene?: {
    id: string;
    name: string;
    type?: SceneType;
  };
  /** Staged text for the floating guide, in order. */
  guideSteps?: GuideStep[];
  /** Premade world for the pinned scene, one string per playfield row
      anchored to the floor. 'B' cells take the block image the student made
      most recently, 'S' their first character. */
  worldStartPattern?: string[];
  /** Legacy stringified XML toolbox. */
  toolboxBlocks?: string;
  /** Runtime libraries the level opts into (see usesPlatformPhysics). */
  helperLibraries?: string[];
}
