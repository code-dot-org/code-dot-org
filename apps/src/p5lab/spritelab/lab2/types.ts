import * as BlocklyCore from 'blockly/core';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {BlocklyLevelProperties, ProjectSources} from '../../../lab2/types';

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

// One AI-generated (or otherwise tracked) item shown in the Items tab gallery.
// The image itself lives in the project asset bucket and, once bridged into the
// animationList, is an ordinary Sprite Lab costume/background.
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

// One scene in the scenes UI variant: a named code workspace. The id is the
// source of truth (the go-to-scene block stores it); the name is the friendly
// label users see. Scenes share the project-wide image library. scenes[0] is
// the default scene the Play tab starts at.
export interface SpriteLab2Scene {
  id: string;
  name: string;
  // This scene's Blockly workspace serialization.
  source?: WorkspaceSerialization;
}

// The single ProjectSources.source JSON for a SpriteLab2 project.
export interface SpriteLab2Source extends ProjectSources {
  // Code tab Blockly workspace serialization.
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
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
