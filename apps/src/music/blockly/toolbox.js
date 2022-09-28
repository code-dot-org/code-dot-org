import moduleStyles from '@cdo/apps/music/music.module.scss';
import {BlockTypes} from './blockTypes';

export const baseToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Samples',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer,
        row: moduleStyles.blocklyTreeRow
      },
      contents: []
    },
    {
      kind: 'category',
      name: 'Control',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer,
        row: moduleStyles.blocklyTreeRow
      },
      contents: [
        {
          kind: 'block',
          type: BlockTypes.LOOP_FROM_TO
        },
        {
          kind: 'block',
          type: BlockTypes.IF_EVEN_THEN
        }
      ]
    },
    {
      kind: 'category',
      name: 'Math',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer,
        row: moduleStyles.blocklyTreeRow
      },
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
        }
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer,
        row: moduleStyles.blocklyTreeRow
      },
      contents: [
        {
          kind: 'button',
          text: 'Create variable...',
          callbackKey: 'createVariableHandler'
        },
        {
          kind: 'block',
          type: BlockTypes.VARIABLES_GET
        },
        {
          kind: 'block',
          type: BlockTypes.VARIABLES_SET,
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
    }
  ]
};

export const createMusicToolbox = library => {
  const toolbox = {...baseToolbox};

  // Currently only supports 1 group
  const group = library.groups[0];
  for (let folder of group.folders) {
    let category = {
      kind: 'category',
      name: folder.name,
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer,
        row: moduleStyles.blocklyTreeRow
      },
      contents: []
    };

    for (let sound of folder.sounds) {
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
    }

    // Add to samples category
    toolbox.contents[0].contents.push(category);
  }

  return toolbox;
};
