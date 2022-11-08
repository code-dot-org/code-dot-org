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
    message0: '%1 triggered at %2',
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
    inputsInline: true,
    nextStatement: null,
    colour: 230,
    tooltip: 'at trigger',
    extensions: ['dynamic_trigger_extension']
  },
  generator: ctx => {
    const varName = Blockly.JavaScript.nameDB_.getName(
      ctx.getFieldValue('var'),
      Blockly.Names.NameType.VARIABLE
    );
    return `
      ${varName} = MusicPlayer.getPlayheadPosition();
      \n`;
  }
};
