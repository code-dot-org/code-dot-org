import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';
import {fieldTriggerDefinition} from '../fields';

export const whenRun = {
  definition: {
    type: BlockTypes.WHEN_RUN,
    style: 'setup_blocks',
    message0: musicI18n.blockly_blockWhenRun(),
    inputsInline: true,
    nextStatement: null,
    tooltip: musicI18n.blockly_blockWhenRunTooltip(),
    helpUrl: '',
  },
  generator: ctx => {
    const nextBlock = ctx.nextConnection && ctx.nextConnection.targetBlock();
    let handlerCode = Blockly.JavaScript.blockToCode(nextBlock, false);
    ctx.skipNextBlockGeneration = true;
    return `
      if (__context == 'when_run') {
       ${handlerCode}
      }`;
  },
};

export const triggeredAt = {
  definition: {
    type: BlockTypes.TRIGGERED_AT,
    style: 'event_blocks',
    message0: musicI18n.blockly_blockTriggeredAt({trigger: '%1', time: '%2'}),
    args0: [
      fieldTriggerDefinition,
      {
        type: 'field_variable',
        name: 'var',
        variable: 'currentTime',
      },
    ],
    inputsInline: true,
    nextStatement: null,
    tooltip: musicI18n.blockly_blockTriggeredAtTooltip(),
  },
  generator: ctx => {
    const id = ctx.getFieldValue('trigger');
    const varName = Blockly.JavaScript.nameDB_.getName(
      ctx.getFieldValue('var'),
      Blockly.Names.NameType.VARIABLE
    );
    const nextBlock = ctx.nextConnection && ctx.nextConnection.targetBlock();
    let handlerCode = Blockly.JavaScript.blockToCode(nextBlock, false);
    ctx.skipNextBlockGeneration = true;
    return `
      ${varName} = startPosition;
      if (__context == "${id}") {
        ${handlerCode}
      }`;
  },
};

export const triggeredAtSimple = {
  definition: {
    type: BlockTypes.TRIGGERED_AT_SIMPLE,
    message0: musicI18n.blockly_blockTriggered({trigger: '%1'}),
    args0: [fieldTriggerDefinition],
    inputsInline: true,
    nextStatement: null,
    style: 'event_blocks',
    tooltip: musicI18n.blockly_blockTriggeredTooltip(),
  },
  generator: ctx => {
    const varName = Blockly.JavaScript.nameDB_.getDistinctName(
      'eventTime',
      Blockly.Names.NameType.VARIABLE
    );
    return (
      `${varName} = startPosition;\n` +
      `currentMeasureLocation = Math.ceil(${varName});\n`
    );
  },
};
