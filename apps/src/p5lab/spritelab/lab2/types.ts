import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {BlocklyLevelProperties, ProjectSources} from '@cdo/apps/lab2/types';

// The animation-list category marking an image as a background rather than a
// costume.
export const BACKGROUNDS_CATEGORY = 'backgrounds';

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

// Standalone world-grid editor state. Persisted but not yet wired into the
// p5.play runtime (see plan, World tab).
export interface SpriteLab2World {
  id: string;
  grid: string[][];
}

// A named code workspace. The id is the source of truth (the go-to-scene
// block stores it); scenes[0] is the default scene Play starts at.
export interface SpriteLab2Scene {
  id: string;
  name: string;
  // This scene's Blockly workspace serialization.
  source?: WorkspaceSerialization;
}

// The single ProjectSources.source JSON for a SpriteLab2 project.
export interface SpriteLab2Source extends ProjectSources {
  // Sprite Lab costumes + backgrounds, classic serialized animationList shape.
  animations?: SerializedAnimationList;
  // Scenes UI variant: per-scene code workspaces. When present, `source`
  // mirrors scenes[0].source so projects still open with the variant off.
  scenes?: SpriteLab2Scene[];
  // World tab state.
  worlds?: SpriteLab2World[];
  activeWorldId?: string;
  // Items tab gallery metadata.
  items?: SpriteLab2ItemEntry[];
}

export interface SpriteLab2LevelProperties extends BlocklyLevelProperties {
  guideMode?: 'instructions' | 'aiCodeGenerate';
  aiCodeGenerateAdlib?: string;
  aiCodeGenerateText?: boolean;
  // XML string representation of toolbox blocks.
  // TODO: deprecate in favor of the JSON toolbox definition.
  toolboxBlocks?: string;
}
