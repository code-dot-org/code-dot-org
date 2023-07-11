import {Block} from 'blockly';

// Configuration data for a block.
export interface BlockConfig {
  // TODO: specify structure of definition as this is used more
  definition: object;
  generator: (block: Block) => string;
}
