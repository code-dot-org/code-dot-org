import {IProcedureBlock} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';

import type {FieldPlugin, InputPlugin} from './plugins';
import type {RendererClassType} from './renderers/base';

export interface BlocklySerialization {
  blocks?: {
    blocks?: Blockly.serialization.blocks.State[];
  };
}

/**
 * The content defining a list or dropdown field.
 */
export type BlockOptionsList = readonly (readonly [
  (
    | string
    | {
        /** The image URL */
        src: string;
        /** The alt text for the image */
        alt: string;
        /** The width to enforce for the image */
        width?: number;
        /** The height to enforce for the image */
        height?: number;
      }
  ),
  string,
])[];

export interface BlockBaseArgDefinition {
  /** The internal name for the field which is referenced by a generator */
  name: string;
}

export interface BlockFieldPluginArgDefinition extends BlockBaseArgDefinition {
  /** The registered field type */
  type: FieldPlugin;
}

export interface BlockImageArgDefinition {
  /** Explictly an image field */
  type: 'field_image';
  /** The internal name for the field which is referenced by a generator */
  name?: string;
  /** The source of the image */
  src: string;
  /** The width of the image */
  width: number;
  /** The height of the image */
  height: number;
  /** Alt text for the image */
  alt: string;
}

export interface BlockDropdownArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a dropdown field */
  type: 'field_dropdown';
  /** The options for dropdowns or lists */
  options: BlockOptionsList;
}

export interface BlockInputArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a dropdown field */
  type: 'field_input';
  /** The type to explicitly force connecting blocks to output */
  check?: string;
  /** The initial value of the field */
  value?: string | number;
  /** The initial text of the field */
  text?: string;
  /** For input fields, controls browser spellcheck */
  spellcheck?: boolean;
  variable?: string;
}

export interface BlockDummyArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a blank field */
  type: 'input_dummy';
}

export interface BlockStatementArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a statement section */
  type: 'input_statement';
}

export interface BlockNumberArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a numerical input */
  type: 'field_number';
  /** The initial value */
  value: number;
  /** The minimum value */
  min?: number;
  /** The maximum value */
  max?: number;
}

/**
 * The definition of an argument (arg0, etc)
 */
export type BlockArgDefinition =
  | BlockFieldPluginArgDefinition
  | BlockDummyArgDefinition
  | BlockStatementArgDefinition
  | BlockImageArgDefinition
  | BlockNumberArgDefinition
  | BlockDropdownArgDefinition
  | BlockInputArgDefinition;

/**
 * The definition of an argument that Blockly understands (no special features)
 */
export type BlockFlatArgDefinition = Omit<BlockArgDefinition, 'type'> & {
  type: string;
};

/**
 * Our encapsulation of block mutators.
 */
export interface Mutator {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Specifically a block with the procedure mixin methods.
 */
export type ProcedureBlock = Blockly.BlockSvg & IProcedureBlock;

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
 * Blockly doesn't expose its own BlockGenerator for some reason. This is more
 * or less a copy of that which can be used to type code generator functions.
 */
export type BlockGenerator<
  T extends Omit<Blockly.CodeGenerator, 'forBlock'>,
  U extends Environment = Environment,
> = (
  block: Blockly.Block,
  generator: T,
  environment?: U,
) => string | [string, number] | null;

/**
 * The code generation function specific for Javascript generators.
 */
export type JavascriptBlockGenerator = BlockGenerator<JavascriptGenerator>;

/**
 * Describes a custom block.
 *
 * We add a few additional nice-to-haves over the general Blockly block
 * definition for its JSON serialization. These additions let us just
 * directly reference extensions and mixins so that we can guarantee that
 * we register them when we re-use blocks across different environments.
 */
export interface FullBlockDefinition {
  /** The generic name of the block */
  type: string;
  /** The tooltip for the block when it is hovered over */
  tooltip: string;
  /** The URL for the documentation for this block */
  helpUrl?: string;
  /** The style group to apply, e.g. 'math_blocks' */
  style?: string;
  /** Whether or not the inputs should attempt to be inlined */
  inputsInline?: boolean;
  /** The function that generates code for this block. */
  generator: {
    javascript: JavascriptBlockGenerator;
  };
  /** Whether or not this can be attached to a statement */
  previousStatement?: boolean;
  /** Whether or not the block can have subsequent blocks attached to it */
  nextStatement?: boolean;
  /** The output type, which makes this a potential input for another block. */
  output?: string | InputPlugin;
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
  /** Extensions / Mixins to add to this particular block type. */
  extensions?: (string | Extension | Mixin)[];
  /** A mutator to apply to this particular type of block. */
  mutator?: string | Mutator;
}

/**
 * An older block definition that might be supplied which just has an init
 * function and a generator.
 */
export interface OldBlockDefinition {
  /** The generic name of the block */
  type: string;
  /** An init function to fuel the initialization of a new block. */
  init: () => void;
  /** The function that generates code for this block. */
  generator: {
    javascript: JavascriptBlockGenerator;
  };
}

/**
 * Any block definition.
 */
export type BlockDefinition = FullBlockDefinition | OldBlockDefinition;

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

/**
 * Our blocks also have the environment extension, so they are loaded with a
 * function that can retrieve the workspace environment for the session they
 * are within.
 */
export interface BlockSvg<T extends Environment = Environment>
  extends Blockly.BlockSvg {
  environment: T;
  getEnvironment(): T;
  isWithinInlineWorkspace(): boolean;
  isWithinEmbeddedWorkspace(): boolean;
  isWithinMainWorkspace(): boolean;
  isWithinHiddenWorkspace(): boolean;
}
