import {blocks as Blocks} from 'blockly/blocks';
import {javascriptGenerator} from 'blockly/javascript';

import type {BlockDefinition, OldBlockDefinition} from './types';

/**
 * Predefined blocks with the new BlockDefinition format.
 */
const when_run: BlockDefinition = {
  type: 'when_run',
  style: 'setup_blocks',
  tooltip: '',
  helpUrl: '',
  message0: 'when run',
  generator: {
    javascript: () => '\n',
  },
  nextStatement: true,
};

/**
 * This block adds a harmless comment to the code.
 */
const comment: BlockDefinition = {
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
    javascript: block => `// ${block.getFieldValue('COMMENT')}\n`,
  },
};

/**
 * Legacy blocks from Blockly with the OldBlockDefinition format.
 */
const legacyBlocks: {[key: string]: OldBlockDefinition} = Object.fromEntries(
  Object.entries(Blocks).map(([type, value]) => [
    type,
    {
      type,
      init: (value as {init: () => void}).init,
      generator: {
        javascript: block =>
          javascriptGenerator.forBlock[type](block, javascriptGenerator),
      },
    },
  ]),
);

/**
 * All predefined blocks that can be used across the platform.
 */
const blocks = {
  when_run,
  comment,
  ...legacyBlocks,
};

export default blocks;
