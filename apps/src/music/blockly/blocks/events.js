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
  generator: () => `

  var stack = [];

  function play_sequential() {
    var measure = stack.length == 0 ? 1 : stack[stack.length-1].measure;
    stack.push({measure: measure, together: false});
  }

  function end_sequential() {
    var nextMeasure = stack[stack.length-1].measure;
    stack.pop();

    if (stack.length > 0) {
      // now the frame we are returning to has to absorb this information.
      if (stack[stack.length-1].together) {
        stack[stack.length-1].lastMeasures.push(nextMeasure);
      } else {
        stack[stack.length-1].measure = nextMeasure;
      }
    } else {
      console.log("done");
    }
  }

  function play_together() {
    var nextMeasure = stack[stack.length-1].measure;
    stack.push({measure: nextMeasure, together: true, lastMeasures: []});
  }

  function end_together() {
    var nextMeasure = Math.max.apply(Math, stack[stack.length-1].lastMeasures);

    // we are returning to the previous stack frame.
    stack.pop();

    // now the frame we are returning to has to absorb this information.
    if (stack[stack.length-1].together) {
      stack[stack.length-1].lastMeasures.push(nextMeasure);
    } else {
      stack[stack.length-1].measure = nextMeasure;
    }
  }

  function play_sound(id, length) {
    var playMeasure = stack[stack.length-1].measure;
    console.log('sound:', id, 'at', playMeasure, 'length', length);
    if (stack[stack.length-1].together) {
      stack[stack.length-1].lastMeasures.push(playMeasure + length);
    } else {
      stack[stack.length-1].measure += length;
    }
  }

  play_sequential();
  `
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
