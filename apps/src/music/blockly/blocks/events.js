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

export const whenTrigger = {
  definition: {
    type: BlockTypes.WHEN_TRIGGER,
    message0: 'when trigger',
    inputsInline: true,
    nextStatement: null,
    colour: 230,
    tooltip: 'when triger',
    helpUrl: ''
  },
  generator: () => '\n'
};

export const atTrigger = {
  definition: {
    type: BlockTypes.AT_TRIGGER,
    message0: 'button triggered at time %1',
    args0: [
      {
        type: 'field_variable',
        name: 'var',
        variable: 'currentTime'
      }
    ],
    nextStatement: null,
    colour: 230,
    tooltip: 'at trigger'
  },
  generator: ctx => {
    const varName = Blockly.JavaScript.nameDB_.getName(
      ctx.getFieldValue('var'),
      Blockly.Names.NameType.VARIABLE
    );
    return varName + ' = MusicPlayer.getPlayheadPosition();\n';
  }
};
