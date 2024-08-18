import AppConfig, {getBlockMode} from '../appConfig';
import {BlockMode} from '../constants';
import musicI18n from '../locale';

import {BlockTypes} from './blockTypes';
import {
  FIELD_REST_DURATION_NAME,
  PRIMARY_SOUND_INPUT_NAME,
  FIELD_EFFECTS_NAME,
  FIELD_TRIGGER_START_NAME,
  TriggerStart,
  DEFAULT_EFFECT_VALUE,
  FIELD_EFFECTS_VALUE,
} from './constants';

import moduleStyles from '../views/toolbox.module.scss';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: `${moduleStyles.toolboxRow} blocklyTreeRow`, // Used to look up category labels in UI tests
  label: moduleStyles.toolboxLabel,
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
            NUM: 1,
          },
        },
      },
    },
  },
  [BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
  },
  [BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE]: {
    kind: 'block',
    type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
  },
  [BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2]: {
    id: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2]: {
    id: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2]: {
    id: BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2]: {
    id: BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2]: {
    id: BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
    kind: 'block',
    type: BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
  },
  [BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_REST_DURATION_NAME]: '1',
    },
  },
  [BlockTypes.SET_VOLUME_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_EFFECTS_NAME]: 'volume',
      [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
    },
  },
  [BlockTypes.SET_FILTER_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_EFFECTS_NAME]: 'filter',
      [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
    },
  },
  [BlockTypes.SET_DELAY_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    fields: {
      [FIELD_EFFECTS_NAME]: 'delay',
      [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
    },
  },
  [BlockTypes.PLAY_SOUNDS_TOGETHER]: {
    id: BlockTypes.PLAY_SOUNDS_TOGETHER,
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_TOGETHER,
  },
  [BlockTypes.PLAY_SOUNDS_SEQUENTIAL]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
  },
  [BlockTypes.PLAY_SOUNDS_RANDOM]: {
    kind: 'block',
    type: BlockTypes.PLAY_SOUNDS_RANDOM,
  },
  [BlockTypes.REPEAT_SIMPLE2]: {
    id: BlockTypes.REPEAT_SIMPLE2,
    kind: 'block',
    type: BlockTypes.REPEAT_SIMPLE2,
    fields: {
      times: 1,
    },
  },
  [BlockTypes.PLAY_SOUND_IN_TRACK]: {
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
    kind: 'block',
    type: BlockTypes.VALUE_SAMPLE,
  },
  [BlockTypes.REST_IN_TRACK]: {
    kind: 'block',
    type: BlockTypes.REST_IN_TRACK,
    fields: {
      [FIELD_REST_DURATION_NAME]: '1',
    },
  },
  [BlockTypes.NEW_TRACK_AT_START]: {
    kind: 'block',
    type: BlockTypes.NEW_TRACK_AT_START,
  },
  [BlockTypes.NEW_TRACK_AT_MEASURE]: {
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
    kind: 'block',
    type: BlockTypes.NEW_TRACK_ON_TRIGGER,
  },
  [BlockTypes.TRIGGERED_AT]: {
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT,
  },
  [BlockTypes.TRIGGERED_AT_SIMPLE]: {
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT_SIMPLE,
  },
  [BlockTypes.TRIGGERED_AT_SIMPLE2]: {
    kind: 'block',
    type: BlockTypes.TRIGGERED_AT_SIMPLE2,
    fields: {
      [FIELD_TRIGGER_START_NAME]: TriggerStart.NEXT_MEASURE,
    },
  },
  [BlockTypes.FOR_LOOP]: {
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
    kind: 'block',
    type: 'math_number',
  },
  ['math_round']: {
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
  ['controls_if']: {
    kind: 'block',
    type: 'controls_if',
  },
  ['logic_compare']: {
    kind: 'block',
    type: 'logic_compare',
  },
  ['controls_repeat_ext']: {
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

function generateToolbox(categoryBlocksMap, options) {
  const toolbox = {
    kind: options?.type === 'flyout' ? 'flyoutToolbox' : 'categoryToolbox',
    contents: [],
  };

  for (const category of Object.keys(categoryBlocksMap)) {
    // Skip if we aren't allowing anything from this category.
    if (options?.allowList && !options.allowList[category]) {
      continue;
    }

    const categoryContents = [];

    for (const blockName of categoryBlocksMap[category]) {
      // Skip if we aren't allowing this block.
      if (
        options?.allowList &&
        options.allowList[category] &&
        !options.allowList[category].includes(blockName)
      ) {
        continue;
      }

      categoryContents.push(toolboxBlocks[blockName]);
    }

    if (options?.type === 'flyout') {
      toolbox.contents = toolbox.contents.concat(categoryContents);
    } else {
      toolbox.contents.push({
        kind: 'category',
        name: getCategoryName(category),
        cssConfig: baseCategoryCssConfig,
        contents: categoryContents,
      });
    }
  }

  if (options?.includeVariables) {
    toolbox.contents.push({
      kind: 'category',
      name: getCategoryName('Variables'),
      cssConfig: baseCategoryCssConfig,
      custom: 'VARIABLE',
    });
  }

  if (options?.includeFunctions) {
    // Skip if functions are not allowed.
    if (!options.allowList || options.allowList['Functions']) {
      toolbox.contents.push({
        kind: 'category',
        name: getCategoryName('Functions'),
        cssConfig: baseCategoryCssConfig,
        custom: 'PROCEDURE',
      });
    }
  }

  return toolbox;
}

function getCategoryName(category) {
  const categoryTypeToLocalizedName = {
    Control: musicI18n.blockly_toolboxCategoryControl(),
    Effects: musicI18n.blockly_toolboxCategoryEffects(),
    Events: musicI18n.blockly_toolboxCategoryEvents(),
    Functions: musicI18n.blockly_toolboxCategoryFunctions(),
    Logic: musicI18n.blockly_toolboxCategoryLogic(),
    Math: musicI18n.blockly_toolboxCategoryMath(),
    Play: musicI18n.blockly_toolboxCategoryPlay(),
    Simple: musicI18n.blockly_toolboxCategorySimple(),
    Tracks: musicI18n.blockly_toolboxCategoryTracks(),
    Variables: musicI18n.blockly_toolboxCategoryVariables(),
  };

  return categoryTypeToLocalizedName[category];
}

export function getToolbox(toolbox) {
  switch (getBlockMode()) {
    case BlockMode.SIMPLE:
      return generateToolbox({
        Events: [BlockTypes.TRIGGERED_AT_SIMPLE],
        Simple: [
          BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
          BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
          'controls_repeat_ext',
        ],
      });
    case BlockMode.TRACKS:
      return generateToolbox({
        Tracks: [
          BlockTypes.NEW_TRACK_AT_START,
          BlockTypes.NEW_TRACK_AT_MEASURE,
          BlockTypes.NEW_TRACK_ON_TRIGGER,
        ],
        Play: [
          BlockTypes.PLAY_SOUND_IN_TRACK,
          BlockTypes.VALUE_SAMPLE,
          BlockTypes.REST_IN_TRACK,
        ],
        Control: ['controls_repeat_ext'],
        Math: ['math_arithmetic', 'math_random_int', 'math_modulo'],
        Logic: ['controls_if', 'logic_compare'],
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
            'math_modulo',
          ],
          Logic: ['controls_if', 'logic_compare'],
        },
        {
          includeVariables: true,
        }
      );
    case BlockMode.SIMPLE2:
    default:
      return generateToolbox(
        {
          Play: [
            BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
            BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
            ...(AppConfig.getValue('play-pattern-ai-block') === 'true'
              ? [BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2]
              : []),
            BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
            ...(AppConfig.getValue('play-tune-block') === 'true'
              ? [BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2]
              : []),
            BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
          ],
          Control: [
            BlockTypes.TRIGGERED_AT_SIMPLE2,
            BlockTypes.PLAY_SOUNDS_TOGETHER,
            BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
            BlockTypes.PLAY_SOUNDS_RANDOM,
            BlockTypes.REPEAT_SIMPLE2,
          ],
          Effects: [
            BlockTypes.SET_VOLUME_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
            BlockTypes.SET_FILTER_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
            BlockTypes.SET_DELAY_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
          ],
        },
        {
          includeFunctions: true,
          allowList: toolbox?.blocks,
          type: toolbox?.type,
        }
      );
  }
}
