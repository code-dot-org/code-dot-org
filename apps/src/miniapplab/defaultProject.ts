import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {
  AI_ANSWER_BLOCK_TYPE,
  ASK_AI_BLOCK_TYPE,
  GET_TEXT_BLOCK_TYPE,
  SET_TEXT_BLOCK_TYPE,
  WHEN_BUTTON_PRESSED_BLOCK_TYPE,
} from './blockly/blocks';
import {AppDesign} from './types';

// A small working app, so the first Run already does something.
export const defaultDesign: AppDesign = [
  {
    id: 'title',
    type: 'label',
    x: 20,
    y: 20,
    width: 280,
    height: 28,
    text: 'Ask the AI a question',
  },
  {
    id: 'question',
    type: 'input',
    x: 20,
    y: 60,
    width: 280,
    height: 36,
    text: 'Type your question',
  },
  {
    id: 'ask',
    type: 'button',
    x: 20,
    y: 108,
    width: 120,
    height: 36,
    text: 'Ask',
  },
  {
    id: 'answer',
    type: 'output',
    x: 20,
    y: 160,
    width: 280,
    height: 270,
    text: '',
  },
];

export const defaultBlocks: WorkspaceSerialization = {
  blocks: {
    blocks: [
      {
        type: WHEN_BUTTON_PRESSED_BLOCK_TYPE,
        x: 20,
        y: 20,
        fields: {BUTTON: 'ask'},
        inputs: {
          DO: {
            block: {
              type: ASK_AI_BLOCK_TYPE,
              inputs: {
                PROMPT: {
                  block: {
                    type: GET_TEXT_BLOCK_TYPE,
                    fields: {FIELD: 'question'},
                  },
                },
                DO: {
                  block: {
                    type: SET_TEXT_BLOCK_TYPE,
                    fields: {FIELD: 'answer'},
                    inputs: {TEXT: {block: {type: AI_ANSWER_BLOCK_TYPE}}},
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
} as unknown as WorkspaceSerialization;
