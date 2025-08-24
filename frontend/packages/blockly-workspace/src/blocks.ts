/**
 * These are some predefined blocks that can be used across the platform.
 */
import * as Blockly from 'blockly/core';

import type {BlockDefinition} from './types';

const blocks: {
  [key: string]: BlockDefinition;
} = {
  when_run: {
    type: 'when_run',
    style: 'setup_blocks',
    tooltip: '',
    helpUrl: '',
    message0: 'when run',
    generator: {
      javascript: () => '\n',
    },
    nextStatement: true,
  },
  // This block add a harmless comment to the code
  comment: {
    type: 'comment',
    message0: 'comment: %1',
    style: 'comment_blocks',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    args0: [
      {
        name: 'COMMENT',
        check: 'String',
        type: 'field_input',
        text: '',
      },
    ],
    generator: {
      javascript: (block: Blockly.Block) =>
        `// ${block.getFieldValue('COMMENT')}\n`,
    },
  },
};

export default blocks;

