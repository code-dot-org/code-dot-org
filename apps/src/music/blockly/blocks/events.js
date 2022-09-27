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
