import moduleStyles from './toolbox.module.scss';
import {BlockTypes} from './blockTypes';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: moduleStyles.toolboxRow,
  label: moduleStyles.toolboxLabel
};

export const baseToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Play',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'block',
          type: BlockTypes.PLAY_SAMPLE,
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
      name: 'Samples',
      cssConfig: baseCategoryCssConfig,
      contents: []
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
          type: BlockTypes.NUMBER
        },
        {
          kind: 'block',
          type: BlockTypes.ROUND,
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
          type: BlockTypes.ARITHMETIC,
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
          type: BlockTypes.RANDOM,
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
        }
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'button',
          text: 'Create variable...',
          callbackKey: 'createVariableHandler'
        },
        {
          kind: 'block',
          type: BlockTypes.VARIABLES_GET,
          fields: {
            var: {
              name: 'i',
              type: 'number'
            }
          }
        },
        {
          kind: 'block',
          type: BlockTypes.VARIABLES_GET,
          fields: {
            var: {
              name: 'currentTime',
              type: 'number'
            }
          }
        },
        {
          kind: 'block',
          type: BlockTypes.VARIABLES_SET,
          fields: {
            var: {
              name: 'i',
              type: 'number'
            }
          },
          inputs: {
            value: {
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
      name: 'Logic',
      cssConfig: baseCategoryCssConfig,
      contents: [
        {
          kind: 'block',
          type: BlockTypes.SIMPLE_IF,
          fields: {
            var: {
              name: 'currentTime',
              type: 'number'
            }
          }
        }
      ]
    }
  ]
};

export const createMusicToolbox = (library, mode) => {
  const toolbox = {...baseToolbox};

  if (!library) {
    return toolbox;
  }

  toolbox.contents[1].contents = [];

  // Currently only supports 1 group
  const group = library.groups[0];
  for (let folder of group.folders) {
    let category = {
      kind: 'category',
      name: folder.name,
      cssConfig: baseCategoryCssConfig,
      contents: []
    };

    for (let sound of folder.sounds) {
      switch (mode) {
        case 'dropdown': {
          category.contents.push({
            kind: 'block',
            type: BlockTypes.PLAY_SOUND,
            fields: {
              sound: folder.path + '/' + sound.src
            },
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
          });
          break;
        }
        case 'valueSample': {
          category.contents.push({
            kind: 'block',
            type: BlockTypes.SAMPLE,
            fields: {
              sample: sound.name
            }
          });
          break;
        }
        case 'playSample': {
          category.contents.push({
            kind: 'block',
            type: BlockTypes.PLAY_SAMPLE,
            inputs: {
              sample: {
                block: {
                  type: BlockTypes.SAMPLE,
                  fields: {
                    sample: sound.name
                  }
                }
              },
              measure: {
                shadow: {
                  type: 'math_number',
                  fields: {
                    NUM: 1
                  }
                }
              }
            }
          });
        }
      }
    }

    // Add to samples category
    toolbox.contents[1].contents.push(category);
  }

  return toolbox;
};
