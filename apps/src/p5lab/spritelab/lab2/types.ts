import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {BlocklyLevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import {RGBA} from '@cdo/apps/pixelEditor/tools';

import {AddBlockEntry} from './addBlocks';
import {ImageGenerationMetadata, ImageType} from './ai/images/types';
import {LevelCallout} from './callouts';
import {AnimationPoses} from './characterAnimations';
import {ImageRoleDefaults} from './imageRoleDefaults';
import {LevelMode} from './levelMode';
import {Objectives} from './objectives';
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
  /** What the image level that made it was for (level_mode.imageRole). */
  role?: string;
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

/**
 * A named code workspace. The id is the source of truth, being what the
 * go-to-scene block stores; scenes[0] is where Play starts.
 */
export interface Scene {
  id: string;
  name: string;
  /** This scene's Blockly workspace serialization. */
  source?: WorkspaceSerialization;
  /** Starter sprite and block placements, spawned ahead of the program. */
  world?: World;
  /** The scene's first frame as last captured (sceneThumbnails.ts): a
      project asset, and the fingerprint of the scene it shows. */
  thumbnail?: SceneThumbnail;
}

export interface SceneThumbnail {
  url: string;
  fingerprint: string;
}

/** The single ProjectSources.source JSON for a SpriteLab2 project. */
export interface Sources extends ProjectSources {
  /** Costumes and backgrounds, in the classic animationList shape. */
  animations?: SerializedAnimationList;
  /** Per-scene code workspaces. */
  scenes?: Scene[];
  /** Catalog blocks the student added to the toolbox (blockCatalog.ts). */
  chosenBlocks?: string[];
  /** The catalog has opened itself once on the free play level. */
  blockCatalogSeen?: boolean;
}

/** An image a level gives the project: a lab asset by URL, with the
    frame layout an animation needs. */
export interface StarterImage {
  name: string;
  imageType: ImageType;
  role?: string;
  src: string;
  /** One frame's size in px; the whole image when it is a single frame. */
  frameSize: {x: number; y: number};
  /** The sheet's size in px, holding `frameCount` frames row by row. */
  sourceSize?: {x: number; y: number};
  frameCount?: number;
  frameDelay?: number;
  looping?: boolean;
  /** A character's poses on the sheet (characterAnimations.ts). */
  poses?: AnimationPoses;
  /** Pixel art: the size of one drawn pixel in the file, so previews
      upscale it with hard edges. */
  pixelGridSize?: number;
}

export interface SpriteLab2LevelProperties extends BlocklyLevelProperties {
  /** What kind of level this is; decides the tabs and the image controls. */
  levelMode?: LevelMode;
  /** The one scene this level edits, created on first load if the project
      lacks it. The id is the key the go-to-scene block stores; the name is
      what the student sees, applied only at creation. The id 'scene-1' is
      the default scene a scene-less project synthesizes from its top-level
      code: a pin with that id adopts it instead of adding a scene. */
  pinnedScene?: {
    id: string;
    name: string;
    /** The scene's code when the level creates it; the default workspace
        when unset. */
    source?: WorkspaceSerialization;
  };
  /** A second scene the level creates beside the pinned one, for a level
      about jumping between scenes. Its premade world follows the same rules
      as world_start_pattern. */
  extraScene?: {
    id: string;
    name: string;
    source?: WorkspaceSerialization;
    worldStartPattern?: string[];
  };
  /** The level's objectives (objectives.ts): the Guide's text, checklist
      and Continue gate. */
  objectives?: Objectives;
  /** Premade world for the pinned scene (worldStartPattern.ts): one string
      per playfield row anchored to the floor. 'B' cells take the block image
      the student made most recently, 'S' the image_role_defaults sprite,
      'O' its object, else their first character. */
  worldStartPattern?: string[];
  /** The new blocks start out of the toolbox, offered through the new-block
      catalog instead (blockCatalog.ts). */
  blockCatalog?: boolean;
  /** The role each dropdown starts on (imageRoleDefaults.ts); roles are what
      image levels record through level_mode.imageRole. */
  imageRoleDefaults?: ImageRoleDefaults;
  /** Blocks added to the pinned scene when the student arrives and the
      scene has none of that type (addBlocks.ts), in Blockly's block
      state form: an event to fill in, a placeholder shadow on its `next`.
      An entry with `attachTo` instead hangs its shadow on the end of the
      stack already there whose top block has that type, or with `room`
      keeps that block's height free under it, with no outline. */
  addBlocks?: AddBlockEntry[];
  /** Arrows at the lab's tabs while a condition holds (callouts.ts). */
  callouts?: LevelCallout[];
  /** Images the level gives the project on arrival, when it has no image
      of that name or in that role yet. */
  starterImages?: StarterImage[];
  /** Legacy stringified XML toolbox. */
  toolboxBlocks?: string;
  /** Runtime libraries the level opts into (see usesPlatformPhysics). */
  helperLibraries?: string[];
}
