import {BlockTypes} from '../blockTypes';
import {TRIGGER_FIELD} from '../constants';
import {fieldTriggerDefinition} from '../fields';
import {BlockConfig} from '../types';

const loopOptions = {
  type: 'field_dropdown',
  name: 'loop_duration',
  options: [
    ['1', '1'],
    ['2', '2'],
    ['4', '4'],
    ['8', '8'],
    ['16', '16'],
  ],
};

export const setLoop: BlockConfig = {
  definition: {
    type: BlockTypes.SET_LOOP,
    message0: 'loop for %1 measure(s)',
    args0: [loopOptions],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'colour_blocks',
  },
  generator: block => `
    Transport.setLoopEnabled(true);
    Transport.setLoopStart(1);
    Transport.setLoopEnd(1 + ${block.getFieldValue('loop_duration')});
  `,
};

export const setLoopAt: BlockConfig = {
  definition: {
    type: BlockTypes.SET_LOOP_AT,
    message0: 'loop for %1 measure(s) at %2',
    args0: [
      loopOptions,
      {
        type: 'field_number',
        name: 'loop_start',
        value: 1,
        min: 1,
        max: 30,
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'colour_blocks',
  },
  generator: block => `
      Transport.setLoopEnabled(true);
      Transport.setLoopStart(${block.getFieldValue('loop_start')});
      Transport.setLoopEnd(${block.getFieldValue(
        'loop_start'
      )} + ${block.getFieldValue('loop_duration')});
    `,
};

export const jumpToMeasure: BlockConfig = {
  definition: {
    type: BlockTypes.JUMP_TO_MEASURE,
    message0: 'jump to measure %1',
    args0: [
      {
        type: 'field_number',
        name: 'jump_position',
        value: 1,
        min: 1,
        max: 30,
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'colour_blocks',
  },
  generator: block => `
        Transport.jumpToPosition(${block.getFieldValue('jump_position')});
      `,
};

export const triggerAction: BlockConfig = {
  definition: {
    type: BlockTypes.TRIGGER_ACTION,
    message0: 'when %1 pressed',
    args0: [fieldTriggerDefinition],
    inputsInline: true,
    nextStatement: null,
    style: 'event_blocks',
  },
  generator: ctx => {
    const id = ctx.getFieldValue(TRIGGER_FIELD);
    const nextBlock = ctx.nextConnection && ctx.nextConnection.targetBlock();
    const handlerCode = Blockly.JavaScript.blockToCode(nextBlock, false);
    return `
        if (__context == "triggerAction-${id}") {
          ${handlerCode}
        }`;
  },
};
