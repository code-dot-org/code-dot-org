import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {BlocklyLevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import {RGBA} from '@cdo/apps/pixelEditor/tools';

import {SpriteLab2World} from './world';

// The animation-list category marking an image as a background rather than a
// costume.
export const BACKGROUNDS_CATEGORY = 'backgrounds';
// Square tiles for platform pieces (the "make platform blocks" block's grid
// draws from these).
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
  // Physical pixels per art pixel; absent on non-pixel-art animations.
  pixelGridSize?: number;
  // Pixel-editor recently-used colors, in first-seen order; absent until the
  // image is edited there.
  recentColors?: RGBA[];
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

// One Items-tab gallery entry; the image lives in the project asset bucket
// and, once in the animationList, is an ordinary costume/background.
export interface SpriteLab2ItemEntry {
  name: string;
  filename: string;
  prompt?: string;
  itemType?: 'sprite' | 'background';
}

// A behavior2 system implementation (student-facing word: "system"): the
// name keys the generated-code registry (see blockly/behavior2Meta), the
// source is the Systems-tab workspace. Projects without stored behavior2s
// fall back to the defaults in blockly/defaultBehavior2s.
export interface SpriteLab2Behavior2 {
  name: string;
  source?: WorkspaceSerialization;
}

// A named code workspace. The id is the source of truth (the go-to-scene
// block stores it); scenes[0] is the default scene Play starts at.
export interface SpriteLab2Scene {
  id: string;
  name: string;
  // This scene's Blockly workspace serialization.
  source?: WorkspaceSerialization;
  // World-tab experiment: starter sprite/block placements, spawned ahead of
  // the scene's program.
  world?: SpriteLab2World;
}

// The single ProjectSources.source JSON for a SpriteLab2 project.
export interface SpriteLab2Source extends ProjectSources {
  // Sprite Lab costumes + backgrounds, classic serialized animationList shape.
  animations?: SerializedAnimationList;
  // Scenes UI variant: per-scene code workspaces. When present, `source`
  // mirrors scenes[0].source so projects still open with the variant off.
  scenes?: SpriteLab2Scene[];
  // Items tab gallery metadata.
  items?: SpriteLab2ItemEntry[];
  // Behavior2 prototype: this project's system implementations.
  behavior2s?: SpriteLab2Behavior2[];
}

export interface SpriteLab2LevelProperties extends BlocklyLevelProperties {
  guideMode?: 'instructions' | 'aiCodeGenerate';
  aiCodeGenerateAdlib?: string;
  aiCodeGenerateText?: boolean;
  // World-tab experiment: show the tab on this level (equivalent to the
  // world-tab=true URL parameter).
  showWorldTab?: boolean;
  // Behavior2 prototype: enable the Systems tab, the Platform2 blocks, and
  // system composition on this level (equivalent to ?behavior2=true).
  showBehavior2Tab?: boolean;
  // World-tab experiment: the tab edits the whole world, not just the
  // scene-sized corner (equivalent to the world=large URL parameter).
  showLargeWorld?: boolean;
  // XML string representation of toolbox blocks.
  // TODO: deprecate in favor of the JSON toolbox definition.
  toolboxBlocks?: string;
}
