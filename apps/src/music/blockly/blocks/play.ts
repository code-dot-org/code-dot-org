import BlockData from './BlockData';
import {Block, JavaScript} from 'blockly';

const BlockTypes = require('../blockTypes').BlockTypes;
const FIELD_REST_DURATION_NAME = require('../constants')
  .FIELD_REST_DURATION_NAME;

// TODO: Move Play blocks from samples.js and simple2.js into this file.

export const valueRestDuration: BlockData = {
  definition: {
    type: BlockTypes.VALUE_REST_DURATION,
    style: 'music_blocks',
    message0: '%1',
    args0: [
      {
        type: 'field_dropdown',
        name: FIELD_REST_DURATION_NAME,
        options: [
          ['1/2 beat', '0.125'],
          ['1 beat', '0.25'],
          ['2 beats', '0.5'],
          ['1 measure', '1'],
          ['2 measures', '2']
        ]
      }
    ],
    output: 'number'
  },
  generator: (block: Block) => [
    block.getFieldValue(FIELD_REST_DURATION_NAME),
    JavaScript.ORDER_ATOMIC
  ]
};
