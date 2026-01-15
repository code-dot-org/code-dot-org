import * as Blockly from 'blockly/core';

import type {
  BlockArgDefinition,
  BlockDefinition,
  BlockDefinitions,
  BlockFlatArgDefinition,
  BlockSvg,
  JavascriptBlockGenerator,
  OldBlockDefinition,
  ProcedureBlock,
} from './blocks/types';
import type {Mutator} from './mutators/types';
import type {RendererClassType} from './renderers/base';

export {
  BlockArgDefinition,
  BlockDefinition,
  BlockDefinitions,
  BlockFlatArgDefinition,
  BlockSvg,
  JavascriptBlockGenerator,
  OldBlockDefinition,
  ProcedureBlock,
  Mutator,
};

export interface BlocklySerialization {
  blocks?: {
    blocks?: Blockly.serialization.blocks.State[];
  };
}

/**
 * A procedure block with some of the legacy callbacks included.
 */
export type LegacyProcedureBlock = ProcedureBlock & {
  getProcedureCall: () => string;
  renameProcedure: (p1: string, p2: string) => void;
  getProcedureDef: () => [string, string[], boolean];
};

/**
 * Our encapsulation of block extensions, which are functions that are used
 * when generating and initializing certain blocks.
 */
export interface Extension {
  /** The unique name of the extension which can be referenced from other blocks. */
  name: string;
  /** The extension method. We pass in the Blockly environment object, also. */
  extension: (this: Blockly.BlockSvg, environment: Environment) => void;
}

/**
 * Our encapsulation of block mixins, which just add methods and properties to
 * particular block types.
 */
export interface Mixin {
  /** The unique name of the mixin which can be referenced from other blocks. */
  name: string;
  /**
   * The mixin object. Each key will be attached to the Block class for the
   * particular block type which has this mixin listed as an 'extension'.
   *
   * If the mixin object has an 'environment' key, this will be populated by
   * the Blockly environment info which is then accessible by the block's
   * mixin methods.
   */
  mixin: object;
}

/**
 * Describes a collision region.
 */
export interface Collider {
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface ThemeBlockStyle {
  colourPrimary: string;
  colourSecondary?: string;
  colourTertiary?: string;
  hat?: string;
}

/**
 * Our custom theme interface.
 */
export interface Theme {
  definition: {
    /**
     * The human-oriented name of the Theme to place in any settings dialog.
     */
    option: string;
    blockLimits: {
      indicator: {
        fill: string;
        text: string;
      };
      overLimit: {
        fill: string;
        text: string;
      };
    };
    trashcan: {
      fill: string;
    };
    blockStyles: {
      default: ThemeBlockStyle;
      setup_blocks: ThemeBlockStyle;
      event_blocks: ThemeBlockStyle;
      loop_blocks: ThemeBlockStyle;
      logic_blocks: ThemeBlockStyle;
      procedure_blocks: ThemeBlockStyle;
      variable_blocks: ThemeBlockStyle;
      math_blocks: ThemeBlockStyle;
      text_blocks: ThemeBlockStyle;
      colour_blocks: ThemeBlockStyle;
      // Used in Sprite Lab, Dance, Poetry
      sprite_blocks: ThemeBlockStyle;
      // Used in Sprite Lab, Dance, Poetry
      world_blocks: ThemeBlockStyle;
      // Used in Sprite Lab, Dance
      behavior_blocks: ThemeBlockStyle;
      // Used in Sprite Lab only
      location_blocks: ThemeBlockStyle;
      // Formerly called dance_blocks, music_blocks
      lab_blocks: ThemeBlockStyle;
    };
  } & Omit<
    InstanceType<typeof Blockly.Theme>,
    | 'getClassName'
    | 'setBlockStyle'
    | 'setCategoryStyle'
    | 'getComponentStyle'
    | 'setComponentStyle'
    | 'setFontStyle'
    | 'setStartHats'
    | 'blockStyles'
  >;
  instance: Blockly.Theme;
}

/**
 * Our custom renderer interface.
 */
export interface Renderer {
  name: string;
  class: RendererClassType;
}

/**
 * Represents a payload for block mixins and extensions.
 *
 * This can be used to pass information to blocks and Blockly extensions that
 * gives context to the current environment. For instance, to pass along the
 * knowledge of external workspaces, media assets, or library routines.
 */
export interface Environment {
  /** The main workspace reference, when available. */
  mainWorkspace?: Blockly.Workspace;
  /** The hidden workspace reference, when provided. */
  hiddenWorkspace?: Blockly.Workspace;
  /** Whether or not the main workspace is inline */
  inline: boolean;
  /**
   * Whether or not the workspace is considered embedded.
   *
   * An embedded workspace is one that is not meant to be modified, but rather
   * shown as an example or preview.
   */
  embedded: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
