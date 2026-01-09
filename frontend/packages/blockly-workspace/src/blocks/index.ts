import {blocks as Blocks} from 'blockly/blocks';
import {javascriptGenerator} from 'blockly/javascript';

import type {BlockDefinition, OldBlockDefinition} from './types';

/**
 * These are some predefined blocks that can be used across the platform.
 */
const blocks: {
  [key: string]: BlockDefinition | OldBlockDefinition;
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
  } as BlockDefinition,
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
      javascript: block => `// ${block.getFieldValue('COMMENT')}\n`,
    },
  } as BlockDefinition,
  // Other common blocks and their generators
  ...Object.fromEntries(
    Object.entries(Blocks).map(([type, value]) => [
      type,
      {
        type,
        init: (value as {init: () => void}).init,
        generator: {
          javascript: block =>
            javascriptGenerator.forBlock[type](block, javascriptGenerator),
        },
      } as OldBlockDefinition,
    ]),
  ),
};

export default blocks;
