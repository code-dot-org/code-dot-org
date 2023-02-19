import moduleStyles from '../views/toolbox.module.scss';
import {BlockTypes} from './blockTypes';
import {getBlockMode} from '../appConfig';
import {BlockMode} from '../constants';
import {PRIMARY_SOUND_INPUT_NAME} from './constants';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: moduleStyles.toolboxRow,
  label: moduleStyles.toolboxLabel
};

const toolboxBlocks = {
  [BlockTypes.PLAY_SOUND]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUND,
    inputs: {
      measure: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      }
    }
  },
  [BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION
  },
  [BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE]: {
    kind: 'block',
    type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE
  },
  [BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2
  },
  [BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
    inputs: {
      measures: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      }
    }
  },
  [BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2
  },
  [BlockTypes.PLAY_SOUNDS_TOGETHER]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_TOGETHER
  },
  [BlockTypes.PLAY_SOUNDS_SEQUENTIAL]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_SEQUENTIAL
  },
  [BlockTypes.PLAY_SOUND_IN_TRACK]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_IN_TRACK,
    inputs: {
      [PRIMARY_SOUND_INPUT_NAME]: {
        shadow: {
          type: BlockTypes.VALUE_SAMPLE
        }
      }
    }
  },
  [BlockTypes.VALUE_SAMPLE]: {
    kind: 'block',
    type: BlockTypes.VALUE_SAMPLE
  },
  [BlockTypes.REST_IN_TRACK]: {
    kind: 'block',
    type: BlockTypes.REST_IN_TRACK,
    inputs: {
      measures: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      }
    }
  },
  [BlockTypes.NEW_TRACK_AT_START]: {
    kind: 'block',
    type: BlockTypes.NEW_TRACK_AT_START
  },
  [BlockTypes.NEW_TRACK_AT_MEASURE]: {
    kind: 'block',
    type: BlockTypes.NEW_TRACK_AT_MEASURE,
    inputs: {
      measure: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      }
    }
  },
  [BlockTypes.NEW_TRACK_ON_TRIGGER]: {
    kind: 'block',
    type: BlockTypes.NEW_TRACK_ON_TRIGGER
  },
  [BlockTypes.TRIGGERED_AT]: {
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT
  },
  [BlockTypes.TRIGGERED_AT_SIMPLE]: {
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT_SIMPLE
  },
  [BlockTypes.TRIGGERED_AT_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT_SIMPLE2
  },
  [BlockTypes.FOR_LOOP]: {
    kind: 'block',
    type: BlockTypes.FOR_LOOP,
    inputs: {
      FROM: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      },
      TO: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 8
          }
        }
      },
      BY: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 2
          }
        }
      }
    }
  },
  ['math_number']: {
    kind: 'block',
    type: 'math_number'
  },
  ['math_round']: {
    kind: 'block',
    type: 'math_round',
    fields: {
      OP: 'ROUNDUP'
    },
    inputs: {
      NUM: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      }
    }
  },
  ['math_arithmetic']: {
    kind: 'block',
    type: 'math_arithmetic',
    inputs: {
      A: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      },
      B: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      }
    }
  },
  ['math_random_int']: {
    kind: 'block',
    type: 'math_random_int',
    inputs: {
      FROM: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      },
      TO: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 5
          }
        }
      }
    }
  },
  ['math_modulo']: {
    kind: 'block',
    type: 'math_modulo',
    inputs: {
      DIVIDEND: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 3
          }
        }
      },
      DIVISOR: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 2
          }
        }
      }
    }
  },
  ['controls_if']: {
    kind: 'block',
    type: 'controls_if'
  },
  ['logic_compare']: {
    kind: 'block',
    type: 'logic_compare'
  },
  ['controls_repeat_ext']: {
    kind: 'block',
    type: 'controls_repeat_ext',
    fields: {
      OP: 'TIMES'
    },
    inputs: {
      TIMES: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 2
          }
        }
      }
    }
  }
};

function generateToolbox(categoryBlocksMap, options) {
  const toolbox = {
    kind: 'categoryToolbox',
    contents: []
  };

  for (const category of Object.keys(categoryBlocksMap)) {
    const categoryContents = [];

    for (const blockName of categoryBlocksMap[category]) {
      categoryContents.push(toolboxBlocks[blockName]);
    }

    toolbox.contents.push({
      kind: 'category',
      name: category,
      cssConfig: baseCategoryCssConfig,
      contents: categoryContents
    });
  }

  if (options?.includeVariables) {
    toolbox.contents.push({
      kind: 'category',
      name: 'Variables',
      cssConfig: baseCategoryCssConfig,
      custom: 'VARIABLE'
    });
  }

  if (options?.includeFunctions) {
    toolbox.contents.push({
      kind: 'category',
      name: 'Functions',
      cssConfig: baseCategoryCssConfig,
      custom: 'PROCEDURE'
    });
  }

  return toolbox;
}

export function getToolbox() {
  switch (getBlockMode()) {
    case BlockMode.SIMPLE:
      return generateToolbox({
        Events: [BlockTypes.TRIGGERED_AT_SIMPLE],
        Simple: [
          BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
          BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
          'controls_repeat_ext'
        ]
      });
    case BlockMode.SIMPLE2:
      return generateToolbox(
        {
          Play: [
            BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
            BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
            BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2
          ],
          Control: [
            BlockTypes.TRIGGERED_AT_SIMPLE2,
            BlockTypes.PLAY_SOUNDS_TOGETHER,
            BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
            'controls_repeat_ext'
          ]
        },
        {includeFunctions: true}
      );
    case BlockMode.TRACKS:
      return generateToolbox({
        Tracks: [
          BlockTypes.NEW_TRACK_AT_START,
          BlockTypes.NEW_TRACK_AT_MEASURE,
          BlockTypes.NEW_TRACK_ON_TRIGGER
        ],
        Play: [
          BlockTypes.PLAY_SOUND_IN_TRACK,
          BlockTypes.VALUE_SAMPLE,
          BlockTypes.REST_IN_TRACK
        ],
        Control: ['controls_repeat_ext'],
        Math: ['math_arithmetic', 'math_random_int', 'math_modulo'],
        Logic: ['controls_if', 'logic_compare']
      });
    case BlockMode.ADVANCED:
      return generateToolbox(
        {
          Play: [BlockTypes.PLAY_SOUND],
          Events: [BlockTypes.TRIGGERED_AT],
          Control: [BlockTypes.FOR_LOOP],
          Math: [
            'math_round',
            'math_arithmetic',
            'math_random_int',
            'math_modulo'
          ],
          Logic: ['controls_if', 'logic_compare']
        },
        {includeVariables: true}
      );
  }

  console.warn(
    `Could not find toolbox for unknown block mode: ${getBlockMode()}`
  );
}
