import {Block} from 'blockly';

/**
 * Structure of a Blockly block including its JSON definition and generator function.
 */
export default interface BlockData {
  definition: {
    type: string; // TODO: Use BlockType enum
    style: string; // TODO: maybe use a block style enum
    message0: string;
    args0: object[];
    message1?: string;
    args1?: object[];
    inputsInline?: boolean;
    previousStatement?: null;
    nextStatement?: null;
    output?: string;
    tooltip?: string;
    helpUrl?: string;
  };
  generator: (block: Block) => string | any[]; // Array is used for the return type of value blocks
}
