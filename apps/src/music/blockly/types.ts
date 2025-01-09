import * as GoogleBlockly from 'blockly/core';

import {JavascriptGeneratorType} from '@cdo/apps/blockly/types';

import {BlockTypes} from './blockTypes';

// Configuration data for a block.
export interface BlockConfig {
  definition: BlockJson;
  generator: (
    block: GoogleBlockly.Block,
    generator: JavascriptGeneratorType
  ) => string | [string, number] | null;
}

export interface BlockJson {
  type: BlockTypes;
  [key: `message${number}`]: string;
  [key: `args${number}`]: FieldJson[];
  style?: string;
  inputsInline?: boolean;
  previousStatement?: null;
  nextStatement?: string | null;
  output?: string | null;
  tooltip?: string;
  helpUrl?: string;
}

export interface FieldJson {
  type: string;
  name: string;
}
