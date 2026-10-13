import * as BlocklyCore from 'blockly/core';

import {
  AI_ANSWER_BLOCK_TYPE,
  ASK_AI_BLOCK_TYPE,
  GET_TEXT_BLOCK_TYPE,
  JOIN_BLOCK_TYPE,
  SET_TEXT_BLOCK_TYPE,
  WHEN_BUTTON_PRESSED_BLOCK_TYPE,
} from './blocks';

// A flat toolbox: few enough blocks that categories would only hide them.
export const toolbox: BlocklyCore.utils.toolbox.ToolboxInfo = {
  kind: 'flyoutToolbox',
  contents: [
    {kind: 'block', type: WHEN_BUTTON_PRESSED_BLOCK_TYPE},
    {
      kind: 'block',
      type: SET_TEXT_BLOCK_TYPE,
      inputs: {
        TEXT: {shadow: {type: 'text', fields: {TEXT: 'Hello'}}},
      },
    },
    {kind: 'block', type: GET_TEXT_BLOCK_TYPE},
    {kind: 'block', type: 'text', fields: {TEXT: ''}},
    {
      kind: 'block',
      type: JOIN_BLOCK_TYPE,
      inputs: {
        A: {shadow: {type: 'text', fields: {TEXT: ''}}},
        B: {shadow: {type: 'text', fields: {TEXT: ''}}},
      },
    },
    {
      kind: 'block',
      type: ASK_AI_BLOCK_TYPE,
      inputs: {
        PROMPT: {shadow: {type: 'text', fields: {TEXT: 'Tell me a joke'}}},
      },
    },
    {kind: 'block', type: AI_ANSWER_BLOCK_TYPE},
  ],
};
