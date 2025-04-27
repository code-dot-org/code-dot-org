import * as BlocklyLibrary from 'blockly/core';

/**
 * Describes a custom block.
 */
export interface BlockDefinition {
  /** The generic name of the block */
  name: string;
  /** The text rendered within the block */
  title: string;
  /** The tooltip for the block when it is hovered over */
  tooltip: string;
  /** The name of the function this block calls for code generation */
  functionName: string;
  /** The URL for the documentation for this block */
  helpUrl?: string;
  /** The image to use instead of text to represent what this block does for pre-readers */
  titleImage?: string;
  /** The style group to apply, e.g. 'math_blocks' */
  style?: string;
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

/**
 * Our custom theme interface.
 */
export interface Theme {
  definition: {
    blockLimits: {
      indicator: {
        fill: string;
      };
      overLimit: {
        fill: string;
      };
    };
  } & BlocklyLibrary.Theme.ITheme;
  instance: BlocklyLibrary.Theme;
}
