import type {IProcedureBlock} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';

import type {FieldPlugin, InputPlugin} from '../plugins';
import type {Mutator, Environment, Extension, Mixin} from '../types';

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
  type: 'input_value' | 'field_input';
  /** The type to explicitly force connecting blocks to output */
  check?: string;
  /** The initial value of the field */
  value?: string | number;
  /** The initial text of the field */
  text?: string;
  /** For input fields, controls browser spellcheck */
  spellcheck?: boolean;
  variable?: string;
  /** The alignment of the field */
  align?: 'LEFT' | 'RIGHT' | 'CENTRE';
}

export interface BlockDummyArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a blank field */
  type: 'input_dummy';
}

export interface BlockStatementArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a statement section */
  type: 'input_statement';
}

export interface BlockVariableArgDefinition extends BlockBaseArgDefinition {
  /** Explictly a statement section */
  type: 'field_variable';
  /** The name of the variable */
  variable: string;
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
  | BlockVariableArgDefinition
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MutatorBlock<T, B extends BlockSvg<any> = BlockSvg> =
  T extends Mutator<infer _S, infer U> ? B & U : B;

/**
 * Specifically a block with the procedure mixin methods.
 */
export type ProcedureBlock = Blockly.BlockSvg & IProcedureBlock;

/**
 * Blockly doesn't expose its own BlockGenerator for some reason. This is more
 * or less a copy of that which can be used to type code generator functions.
 */
export type BlockGenerator<
  B extends BlockSvg,
  T extends Omit<Blockly.CodeGenerator, 'forBlock'>,
  U extends Environment = Environment,
> = (
  block: B,
  generator: T,
  environment: U,
) => string | [string, number] | null;

/**
 * The code generation function specific for Javascript generators.
 */
export type JavascriptBlockGenerator<
  B extends BlockSvg = BlockSvg,
  U extends Environment = Environment,
> = BlockGenerator<B, JavascriptGenerator, U>;

/**
 * Describes a custom block.
 *
 * We add a few additional nice-to-haves over the general Blockly block
 * definition for its JSON serialization. These additions let us just
 * directly reference extensions and mixins so that we can guarantee that
 * we register them when we re-use blocks across different environments.
 */
export interface BaseBlockDefinition {
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
  /** Extensions to add to this particular block type. */
  extensions?: (string | Extension)[];
  /** Mixins to add properties and methods to the Block instance inside generators. */
  mixins?: Mixin[];
}

export interface BlockDefinitionWithMutator<
  T extends Mutator,
  U extends Environment = Environment,
  B extends BlockSvg<U> = BlockSvg<U>,
> extends BaseBlockDefinition {
  /** A mutator to apply to this particular type of block. */
  mutator: T;
  /** The function that generates code for this block. */
  generator: {
    javascript: JavascriptBlockGenerator<MutatorBlock<T, B>, U>;
  };
}

export interface BlockDefinitionWithoutMutator<
  U extends Environment = Environment,
  B extends BlockSvg<U> = BlockSvg<U>,
> extends BaseBlockDefinition {
  /** A mutator to apply to this particular type of block. */
  mutator?: never;
  /** The function that generates code for this block. */
  generator: {
    javascript: JavascriptBlockGenerator<B, U>;
  };
}

export type BlockDefinition<
  T extends Mutator = Mutator,
  U extends Environment = Environment,
> = BlockDefinitionWithMutator<T, U> | BlockDefinitionWithoutMutator<U>;

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
 * A set of blocks.
 */
export type BlockDefinitions = (BlockDefinition | OldBlockDefinition)[];
