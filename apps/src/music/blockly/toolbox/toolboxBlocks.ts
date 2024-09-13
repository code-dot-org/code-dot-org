import {BlockInfo} from 'blockly/core/utils/toolbox';

import {BlockTypes} from '../blockTypes';
import {
  DEFAULT_EFFECT_VALUE,
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  FIELD_REST_DURATION_NAME,
  FIELD_TRIGGER_START_NAME,
  PRIMARY_SOUND_INPUT_NAME,
  TriggerStart,
} from '../constants';

// Blockly's BlockInfo type with an additional 'levelbuilderText' field used for levelbuilder-facing English block text.
type BlockInfoWithText = BlockInfo & {levelbuilderText: string};

const toolboxBlocks: {[blockType in BlockTypes | string]: BlockInfoWithText} = {
  [BlockTypes.PLAY_SOUND]: {
    levelbuilderText: 'Play Sound at Measure',
    kind: 'block',
    type: BlockTypes.PLAY_SOUND,
    inputs: {
      measure: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
    },
  },
  [BlockTypes.PLAY_PATTERN_AT_MEASURE]: {
    levelbuilderText: 'Play Pattern at Measure',
    kind: 'block',
    type: BlockTypes.PLAY_PATTERN_AT_MEASURE,
    inputs: {
      measure: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
    },
  },
  [BlockTypes.PLAY_CHORD_AT_MEASURE]: {
    levelbuilderText: 'Play Chord at Measure',
    kind: 'block',
    type: BlockTypes.PLAY_CHORD_AT_MEASURE,
    inputs: {
      measure: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
    },
  },
  [BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
  },
  [BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
  },
  [BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Play Sound',
    id: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Play Drums',
    id: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Play AI Drums',
    id: BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Play Chord',
    id: BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Play Tune',
    id: BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Rest',
    kind: 'block',
    type: BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_REST_DURATION_NAME]: '1',
    },
  },
  [BlockTypes.SET_VOLUME_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Set Volume',
    kind: 'block',
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_EFFECTS_NAME]: 'volume',
      [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
    },
  },
  [BlockTypes.SET_FILTER_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Set Filter',
    kind: 'block',
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_EFFECTS_NAME]: 'filter',
      [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
    },
  },
  [BlockTypes.SET_DELAY_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: {
    levelbuilderText: 'Set Delay',
    kind: 'block',
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_EFFECTS_NAME]: 'delay',
      [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
    },
  },
  [BlockTypes.PLAY_SOUNDS_TOGETHER]: {
    levelbuilderText: 'Play Together',
    id: BlockTypes.PLAY_SOUNDS_TOGETHER,
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_TOGETHER,
  },
  [BlockTypes.PLAY_SOUNDS_SEQUENTIAL]: {
    levelbuilderText: 'Play Sequential',
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
  },
  [BlockTypes.PLAY_SOUNDS_RANDOM]: {
    levelbuilderText: 'Play Random',
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_RANDOM,
  },
  [BlockTypes.REPEAT_SIMPLE2]: {
    levelbuilderText: 'Repeat',
    id: BlockTypes.REPEAT_SIMPLE2,
    kind: 'block',
    type: BlockTypes.REPEAT_SIMPLE2,
    fields: {
      times: 1,
    },
  },
  [BlockTypes.PLAY_SOUND_IN_TRACK]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_IN_TRACK,
    inputs: {
      [PRIMARY_SOUND_INPUT_NAME]: {
        shadow: {
          type: BlockTypes.VALUE_SAMPLE,
        },
      },
    },
  },
  [BlockTypes.VALUE_SAMPLE]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.VALUE_SAMPLE,
  },
  [BlockTypes.REST_IN_TRACK]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.REST_IN_TRACK,
    fields: {
      [FIELD_REST_DURATION_NAME]: '1',
    },
  },
  [BlockTypes.NEW_TRACK_AT_START]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.NEW_TRACK_AT_START,
  },
  [BlockTypes.NEW_TRACK_AT_MEASURE]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.NEW_TRACK_AT_MEASURE,
    inputs: {
      measure: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
    },
  },
  [BlockTypes.NEW_TRACK_ON_TRIGGER]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.NEW_TRACK_ON_TRIGGER,
  },
  [BlockTypes.TRIGGERED_AT]: {
    levelbuilderText: 'Triggered at Time',
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT,
  },
  [BlockTypes.TRIGGERED_AT_SIMPLE]: {
    levelbuilderText: 'unused',
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT_SIMPLE,
  },
  [BlockTypes.TRIGGERED_AT_SIMPLE2]: {
    levelbuilderText: 'Trigger',
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT_SIMPLE2,
    fields: {
      [FIELD_TRIGGER_START_NAME]: TriggerStart.NEXT_MEASURE,
    },
  },
  [BlockTypes.FOR_LOOP]: {
    levelbuilderText: 'For Loop',
    kind: 'block',
    type: BlockTypes.FOR_LOOP,
    inputs: {
      FROM: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
      TO: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 8,
          },
        },
      },
      BY: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 2,
          },
        },
      },
    },
  },
  ['math_number']: {
    levelbuilderText: 'Number',
    kind: 'block',
    type: 'math_number',
  },
  ['math_round']: {
    levelbuilderText: 'Round',
    kind: 'block',
    type: 'math_round',
    fields: {
      OP: 'ROUNDUP',
    },
    inputs: {
      NUM: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
    },
  },
  ['math_arithmetic']: {
    levelbuilderText: 'Arithmetic',
    kind: 'block',
    type: 'math_arithmetic',
    inputs: {
      A: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
      B: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
    },
  },
  ['math_random_int']: {
    levelbuilderText: 'Random Integer',
    kind: 'block',
    type: 'math_random_int',
    inputs: {
      FROM: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1,
          },
        },
      },
      TO: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 5,
          },
        },
      },
    },
  },
  ['math_modulo']: {
    levelbuilderText: 'Remainder of',
    kind: 'block',
    type: 'math_modulo',
    inputs: {
      DIVIDEND: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 3,
          },
        },
      },
      DIVISOR: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 2,
          },
        },
      },
    },
  },
  ['math_number_property']: {
    levelbuilderText: 'Number Property',
    kind: 'block',
    type: 'math_number_property',
  },
  ['controls_if']: {
    levelbuilderText: 'If',
    kind: 'block',
    type: 'controls_if',
  },
  ['logic_compare']: {
    levelbuilderText: 'Compare',
    kind: 'block',
    type: 'logic_compare',
  },
  ['controls_repeat_ext']: {
    levelbuilderText: 'Repeat',
    kind: 'block',
    type: 'controls_repeat_ext',
    fields: {
      OP: 'TIMES',
    },
    inputs: {
      TIMES: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 2,
          },
        },
      },
    },
  },
};

export default toolboxBlocks;
