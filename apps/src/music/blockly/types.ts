import {Block} from 'blockly';

import {BlockTypes} from './blockTypes';

// Configuration data for a block.
export interface BlockConfig {
  definition: BlockJson;
  generator: (block: Block) => string | string[];
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
