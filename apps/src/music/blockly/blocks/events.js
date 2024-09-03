import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';
import {fieldTriggerDefinition, TRIGGER_FIELD} from '../fields';

export const whenRun = {
  definition: {
    type: BlockTypes.WHEN_RUN,
    style: 'setup_blocks',
    message0: musicI18n.blockly_blockWhenRun(),
    inputsInline: true,
    nextStatement: null,
    tooltip: musicI18n.blockly_blockWhenRunTooltip(),
    helpUrl: '',
    /*message0: "%1",
    args0: [
      {
        type: 'input_statement',
        name: 'code',
      },
    ],*/
  },
  /*generator: ctx => {
    return `
      // start run
      if (currentContext === "when_run") {
        ${Blockly.JavaScript.blockToCode(ctx.getChildren()[0])}
      }
      // end run
      \n`;
  },*/
  generator: () => 'var currentMeasureLocation = 1;\n',
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
    /*message1: "%1",
    args1: [
      {
        type: 'input_statement',
        name: 'code',
      },
    ],*/
    inputsInline: true,
    nextStatement: null,
    tooltip: musicI18n.blockly_blockTriggeredAtTooltip(),
  },
  generator: ctx => {
    const varName = Blockly.JavaScript.nameDB_.getName(
      ctx.getFieldValue('var'),
      Blockly.Names.NameType.VARIABLE
    );
    return `
      // start trigger
      if (currentContext === "${ctx.getFieldValue('trigger')}") {
        ${varName} = startPosition;
        ${''/*${Blockly.JavaScript.statementToCode(ctx, 'code')}*/}
        ${Blockly.JavaScript.blockToCode(ctx.getChildren()[0])}
      }
      // end trigger
      \n`;
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
