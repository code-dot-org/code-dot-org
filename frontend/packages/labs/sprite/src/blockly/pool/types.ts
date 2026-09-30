import type * as BlocklyCore from 'blockly/core';
import type {JavascriptGenerator} from 'blockly/javascript';

/** One argument of a pool block, as the block pool stores it. */
export interface PoolArg {
  name: string;
  /** A BlockValueType: the socket's check, or how a field's value is quoted. */
  type?: string;
  /** Dropdown options: label, then the code-ready value. */
  options?: string[][];
  field?: boolean;
  customInput?: string;
  statement?: boolean;
  dummy?: boolean;
  inline?: boolean;
  variableInput?: boolean;
  /** The block assigns to this input's variable. */
  assignment?: boolean;
  /** The input's code is wrapped in a function, to be evaluated later. */
  defer?: boolean;
  strict?: boolean;
  customOptions?: {assetUrl?: string; width?: number; height?: number};
}

/** A pool block's `config`: apps' createJsWrapperBlockCreator options. */
export interface PoolBlockConfig {
  style?: string;
  func?: string;
  expression?: string;
  orderPrecedence?: number;
  name?: string;
  blockText: string;
  args?: PoolArg[];
  returnType?: string;
  strictOutput?: boolean;
  methodCall?: boolean;
  objectType?: string;
  thisObject?: string;
  eventBlock?: boolean;
  eventLoopBlock?: boolean;
  inline?: boolean;
  simpleValue?: boolean;
  extraArgs?: string[];
  callbackParams?: string[];
  miniToolboxBlocks?: string[];
  docFunc?: string;
}

/** One entry of a level's `sharedBlocks`, as dashboard's Block serializes it. */
export interface PoolBlock {
  name?: string;
  pool?: string;
  category?: string;
  config: PoolBlockConfig;
  helperCode?: string | null;
}

/** An input as determineInputs lays it out. */
export interface LabeledInput {
  name?: string;
  /** A standard input type's name or a custom input type's. */
  mode: string;
  label?: string;
  strict?: boolean;
  type?: string;
  options?: string[][];
  assignment?: boolean;
  defer?: boolean;
  customOptions?: PoolArg['customOptions'];
}

/**
 * How one kind of input is built and compiled: apps' InputType. Exactly
 * one of addInputRow (a row-ending input) and addInput (fields appended to
 * the row's input) is defined. The first argument, apps' Blockly wrapper,
 * is unused.
 */
export interface InputType {
  addInputRow?: (
    blockly: unknown,
    block: BlocklyCore.Block,
    input: LabeledInput,
  ) => BlocklyCore.Input;
  addInput?: (
    blockly: unknown,
    block: BlocklyCore.Block,
    input: LabeledInput,
    row: BlocklyCore.Input,
  ) => void;
  generateCode: (
    block: BlocklyCore.Block,
    input: LabeledInput,
    generator: JavascriptGenerator,
  ) => string | string[] | null | undefined;
}
