import * as BlocklyCore from 'blockly/core';

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

// The single ProjectSources.source JSON for a SpriteLab2 project.
export interface SpriteLab2Source extends ProjectSources {
  // Code tab Blockly workspace serialization.
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // Sprite Lab costumes + backgrounds, classic serialized animationList shape.
  animations?: SerializedAnimationList;
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
  // The Sprite Lab Blockly toolbox as an XML string (delivered by
  // Blockly#summarize_for_lab2_properties). Sprite Lab uses XML toolboxes
  // rather than the JSON toolboxDefinition that other Lab2 Blockly labs use.
  toolbox?: string;
}
