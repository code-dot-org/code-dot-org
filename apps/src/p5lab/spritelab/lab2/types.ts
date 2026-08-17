import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {BlocklyLevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import {RGBA} from '@cdo/apps/pixelEditor/tools';

import {SpriteLab2Tab} from './redux/spriteLab2Redux';
import {SpriteLab2World} from './world';

// The animation-list category marking an image as a background rather than a
// costume.
export const BACKGROUNDS_CATEGORY = 'backgrounds';
// Square tiles for platform pieces (the "make platform blocks" block's grid
// draws from these).
export const BLOCKS_CATEGORY = 'blocks';

// 'block' is a square platform tile: keyed and cropped to its content so
// copies tile seamlessly when laid out on the grid.
export type SpriteLab2ImageType = 'sprite' | 'background' | 'block';

// Visual style. 'pixel' yields crisp pixel art with hard edges; 'smooth' a
// shaded illustration. See removeBackground's MatteOptions.
export type SpriteLab2ImageStyle = 'smooth' | 'pixel';

// Display names, shared so the image dialog's summary and generate views
// use the same words.
export const IMAGE_TYPE_LABELS: Record<SpriteLab2ImageType, string> = {
  sprite: 'Sprite',
  background: 'Background',
  block: 'Block',
};
export const IMAGE_STYLE_LABELS: Record<SpriteLab2ImageStyle, string> = {
  smooth: 'Smooth',
  pixel: 'Pixel art',
};

/**
 * How an AI-generated image was made, recorded on its animation so a later
 * generation can replay the same roll of randomness or start from the
 * current image.
 */
export interface ImageGenerationMetadata {
  prompt: string;
  imageType: SpriteLab2ImageType;
  style: SpriteLab2ImageStyle;
  /** Sending the same seed and prompt again asks for the same image. */
  seed: number;
  /** Sampling wildness the user chose; absent = the service default. */
  temperature?: number;
  /** True when the image was made by modifying its previous version. */
  editedPrevious?: boolean;
}

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
  // Present on AI-generated images.
  generation?: ImageGenerationMetadata;
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
}

/**
 * One stage of a level's floating-guide instructions. `text` is markdown;
 * `after` is what must hold to reach this step from the one before it, every
 * listed clause of it (the first step needs none).
 */
export interface SpriteLab2GuideStep {
  text: string;
  after?: {
    /** At least this many block-kind cells placed in the World. */
    worldBlocks?: number;
    /** At least one sprite-kind cell placed in the World. */
    worldSprite?: boolean;
    /** This tab is active. */
    tab?: SpriteLab2Tab;
  };
}

export interface SpriteLab2LevelProperties extends BlocklyLevelProperties {
  guideMode?: 'instructions' | 'aiCodeGenerate';
  aiCodeGenerateAdlib?: string;
  aiCodeGenerateText?: boolean;
  // World-tab experiment: show the tab on this level (equivalent to the
  // world-tab=true URL parameter).
  showWorldTab?: boolean;
  // World-tab experiment: the tab edits the whole world, not just the
  // scene-sized corner (equivalent to the world=large URL parameter).
  showLargeWorld?: boolean;
  // The tabs this level shows, in the order that names the starting tab
  // (the first entry). Absent or empty means the default set.
  visibleTabs?: SpriteLab2Tab[];
  // Staged text for the floating guide, in order; requires guideMode.
  guideSteps?: SpriteLab2GuideStep[];
  // Locks the new-image dialog's Type choice.
  fixedImageType?: SpriteLab2ImageType;
  // The one scene this level edits, created on first load if the project
  // lacks it. Must not be 'scene-1' (the id synthesized for sources saved
  // before scenes existed).
  fixedSceneId?: string;
  // Name given to the fixed scene at creation.
  fixedSceneName?: string;
  /** Legacy stringified XML toolbox. */
  toolboxBlocks?: string;
}
