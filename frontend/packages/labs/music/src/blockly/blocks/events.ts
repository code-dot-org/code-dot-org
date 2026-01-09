import * as Blockly from 'blockly/core';
import {defineBlock} from '@code-dot-org/blockly-workspace';

import {BlockTypes} from '../blockTypes';
import {fieldTriggerDefinition} from '../fields';
import {TRIGGER_FIELD} from '../constants';

const whenRun = defineBlock({
  type: BlockTypes.WHEN_RUN,
  style: 'setup_blocks',
  message0: 'when run',
  inputsInline: true,
  nextStatement: true,
  tooltip: 'when run',
  helpUrl: '',
  generator: {
    javascript(block, javascriptGenerator) {
      const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
      const handlerCode = javascriptGenerator.blockToCode(nextBlock, false);
      block.skipNextBlockGeneration = true;
      return `
      if (__context == 'when_run') {
        ${handlerCode}
      }`;
    },
  },
});

const triggeredAt = defineBlock({
  type: BlockTypes.TRIGGERED_AT,
  style: 'event_blocks',
  message0: '%1 triggered at %2',
  args0: [
    fieldTriggerDefinition,
    {
      type: 'field_variable',
      name: 'var',
      variable: 'currentTime',
    },
  ],
  inputsInline: true,
  nextStatement: true,
  tooltip: 'at trigger',
  generator: {
    javascript(block, javascriptGenerator) {
      const id = block.getFieldValue(TRIGGER_FIELD);
      const varName =
        javascriptGenerator.nameDB_?.getName(
          block.getFieldValue('var'),
          Blockly.Names.NameType.VARIABLE,
        ) || 'unknown';
      const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
      const handlerCode = javascriptGenerator.blockToCode(nextBlock, false);
      block.skipNextBlockGeneration = true;
      return `
      ${varName} = startPosition;
      if (__context == "${id}") {
        ${handlerCode}
      }`;
    },
  },
});

const triggeredAtSimple = defineBlock({
  type: BlockTypes.TRIGGERED_AT_SIMPLE,
  message0: 'when %1 triggered at %2',
  args0: [fieldTriggerDefinition],
  inputsInline: true,
  nextStatement: true,
  style: 'event_blocks',
  tooltip: 'at trigger',
  generator: {
    javascript(_block, javascriptGenerator) {
      const varName =
        javascriptGenerator.nameDB_?.getDistinctName(
          'eventTime',
          Blockly.Names.NameType.VARIABLE,
        ) || 'unknown';
      return (
        `${varName} = startPosition;\n` +
        `currentMeasureLocation = Math.ceil(${varName});\n`
      );
    },
  },
});

const blocks = [whenRun, triggeredAt, triggeredAtSimple];

export default blocks;
