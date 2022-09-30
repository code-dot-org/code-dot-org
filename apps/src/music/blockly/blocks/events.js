import {BlockTypes} from '../blockTypes';

export const whenRun = {
  definition: {
    type: BlockTypes.WHEN_RUN,
    message0: 'when run',
    inputsInline: true,
    nextStatement: null,
    colour: 230,
    tooltip: 'when run',
    helpUrl: ''
  },
  generator: () => '\n'
};

export const triggeredAt = {
  definition: {
    type: BlockTypes.TRIGGERED_AT,
    message0: '%1 triggered at time %2',
    args0: [
      {
        type: 'input_dummy',
        name: 'trigger'
      },
      {
        type: 'field_variable',
        name: 'var',
        variable: 'currentTime'
      }
    ],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'code'
      }
    ],
    inputsInline: true,
    colour: 230,
    tooltip: 'at trigger',
    extensions: ['dynamic_trigger_extension']
  },
  generator: ctx => {
    const varName = Blockly.JavaScript.nameDB_.getName(
      ctx.getFieldValue('var'),
      Blockly.Names.NameType.VARIABLE
    );
    const triggerId = ctx.getFieldValue('trigger');
    return `
      ${varName} = MusicPlayer.getPlayheadPosition();
      if ('${triggerId}' === InputContext.getCurrentTriggerId()) { 
        ${Blockly.JavaScript.statementToCode(ctx, 'code')}
      }
      \n`;
  }
};
