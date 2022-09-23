import moduleStyles from '@cdo/apps/music/music.module.scss';

export const baseToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Samples',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer
      },
      contents: []
    },
    {
      kind: 'category',
      name: 'Control',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer
      },
      contents: [
        {
          kind: 'block',
          type: 'loop_from_to'
        },
        {
          kind: 'block',
          type: 'if_even_then'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Math',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer
      },
      contents: [
        {
          kind: 'block',
          type: 'example_number'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      cssConfig: {
        container: moduleStyles.toolboxCategoryContainer
      },
      contents: [
        {
          kind: 'button',
          text: 'Create variable...',
          callbackKey: 'createVariableHandler'
        },
        {
          kind: 'block',
          type: 'variable_get'
        },
        {
          kind: 'block',
          type: 'variable_set'
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
        container: moduleStyles.toolboxCategoryContainer
      },
      contents: []
    };

    // TODO: Create block per sample. For now, just add the standard play blocks for each category
    category.contents.push(
      {
        kind: 'block',
        type: 'play_sound'
      },
      {
        kind: 'block',
        type: 'play_sound_with_variable'
      },
      {
        kind: 'block',
        type: 'play_sound_next_measure'
      }
    );

    // for (let sound of folder.sounds) {
    //   category.contents.push({
    //     kind: 'block',
    //     type: 'play_sample'
    //   });
    // }

    // Add to samples category
    toolbox.contents[0].contents.push(category);
  }

  return toolbox;
};
