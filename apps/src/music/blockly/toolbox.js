import moduleStyles from './toolbox.module.scss';
import {BlockTypes} from './blockTypes';
import AppConfig from '../appConfig';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: moduleStyles.toolboxRow,
  label: moduleStyles.toolboxLabel
};

const baseToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Play',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
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
        }
      ]
    },
    {
      kind: 'category',
      name: 'Events',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'block',
          type: BlockTypes.TRIGGERED_AT
        }
      ]
    },
    {
      kind: 'category',
      name: 'Control',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
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
        }
      ]
    },
    {
      kind: 'category',
      name: 'Math',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'block',
          type: 'math_number'
        },
        {
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
        {
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
        {
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
        {
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
        }
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      cssConfig: baseCategoryCssConfig,
      custom: 'VARIABLE'
    },
    {
      kind: 'category',
      name: 'Logic',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'block',
          type: 'controls_if'
        },
        {
          kind: 'block',
          type: 'logic_compare'
        }
      ]
    }
  ]
};

const baseToolboxSimple = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Events',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'block',
          type: BlockTypes.TRIGGERED_AT_SIMPLE
        }
      ]
    },
    {
      kind: 'category',
      name: 'Simple',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'block',
          type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION
        },
        {
          kind: 'block',
          type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE
        },
        {
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
      ]
    }
  ]
};

export function getBaseToolbox() {
  if (AppConfig.getValue('blocks') === 'simple') {
    return baseToolboxSimple;
  }

  return baseToolbox;
}
