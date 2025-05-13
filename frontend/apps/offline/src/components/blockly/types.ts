import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';

export interface BlockArgDefinition {
  type: string;
  name: string;
  options?: [string, string][];
}

/**
 * Describes a simple block.
 */
export interface SimpleBlockDefinition {
  /** The generic name of the block */
  type: string;
  /** The text rendered within the block */
  title: string;
  /** The image to use instead of text to represent what this block does for pre-readers */
  titleImage?: string;
  /** The tooltip for the block when it is hovered over */
  tooltip: string;
  /** The URL for the documentation for this block */
  helpUrl?: string;
  /** The style group to apply, e.g. 'math_blocks' */
  style?: string;
  /** The name of the function this block calls for code generation */
  functionName?: string;
  /** Whether or not this can be attached to a statement */
  previousStatement?: boolean;
  /** Whether or not the block can have subsequent blocks attached to it */
  nextStatement?: boolean;
  /** The function that sets up this block. */
  init?: (
    block: Blockly.Block,
    options?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    },
  ) => void;
}

/**
 * Describes a custom block.
 */
export interface ComplexBlockDefinition {
  /** The generic name of the block */
  type: string;
  /** The tooltip for the block when it is hovered over */
  tooltip: string;
  /** The URL for the documentation for this block */
  helpUrl?: string;
  /** The style group to apply, e.g. 'math_blocks' */
  style?: string;
  /** The function that generates code for this block. */
  generator: (
    block: Blockly.Block,
    generator: JavascriptGenerator,
    options?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    },
  ) => string | [string, number] | null;
  /** Whether or not this can be attached to a statement */
  previousStatement?: boolean;
  /** Whether or not the block can have subsequent blocks attached to it */
  nextStatement?: boolean;
  /** The first caption */
  message0?: string;
  /** The first set of interactive arguments */
  args0?: BlockArgDefinition[];
  /** The second caption */
  message1?: string;
  /** The second set of interactive arguments */
  args1?: BlockArgDefinition[];
  /** The third caption */
  message2?: string;
  /** The third set of interactive arguments */
  args2?: BlockArgDefinition[];
  /** The fourth caption */
  message3?: string;
  /** The fourth set of interactive arguments */
  args3?: BlockArgDefinition[];
}

export type BlockDefinition = SimpleBlockDefinition | ComplexBlockDefinition;

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
  //class: Blockly.blockRendering.Renderer;
  class: Blockly.IRegistrable;
}
