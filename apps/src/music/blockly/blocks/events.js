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
  generator: () => 'var currentMeasureLocation = 1;\n'
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

export const triggeredAtSimple = {
  definition: {
    type: BlockTypes.TRIGGERED_AT_SIMPLE,
    message0: '%1 triggered',
    args0: [
      {
        type: 'input_dummy',
        name: 'trigger'
      }
    ],
    inputsInline: true,
    nextStatement: null,
    colour: 230,
    tooltip: 'at trigger',
    extensions: ['dynamic_trigger_extension']
  },
  generator: ctx => {
    const varName = Blockly.JavaScript.nameDB_.getDistinctName(
      'eventTime',
      Blockly.Names.NameType.VARIABLE
    );
    return (
      `${varName} = MusicPlayer.getPlayheadPosition();\n` +
      `currentMeasureLocation = Math.ceil(${varName});\n`
    );
  }
};
