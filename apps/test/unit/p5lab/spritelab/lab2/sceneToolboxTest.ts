import {toolboxForSceneType} from '@cdo/apps/p5lab/spritelab/lab2/sceneToolbox';

const categories = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Platform',
      contents: [{kind: 'block', type: 'jump'}],
    },
    {kind: 'category', name: 'Story', contents: [{kind: 'block', type: 'say'}]},
    {kind: 'category', name: 'Link', contents: [{kind: 'block', type: 'goTo'}]},
  ],
};

describe('toolboxForSceneType', () => {
  it('flattens to the scene type plus the shared blocks', () => {
    expect(toolboxForSceneType(categories, 'story')).toEqual({
      kind: 'flyoutToolbox',
      contents: [
        {kind: 'block', type: 'say'},
        {kind: 'block', type: 'goTo'},
      ],
    });
    expect(toolboxForSceneType(categories, 'platform')).toEqual({
      kind: 'flyoutToolbox',
      contents: [
        {kind: 'block', type: 'jump'},
        {kind: 'block', type: 'goTo'},
      ],
    });
  });

  it('keeps every block when the scene has no type, still as a flyout', () => {
    // The kind cannot change once Blockly has the workspace, so an untyped
    // scene gets everything rather than the authored categories.
    expect(toolboxForSceneType(categories, undefined)).toEqual({
      kind: 'flyoutToolbox',
      contents: [
        {kind: 'block', type: 'jump'},
        {kind: 'block', type: 'say'},
        {kind: 'block', type: 'goTo'},
      ],
    });
  });

  it('leaves a toolbox that names no scene type as authored', () => {
    const unrelated = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Sprites',
          contents: [{kind: 'block', type: 'a'}],
        },
        {
          kind: 'category',
          name: 'Math',
          contents: [{kind: 'block', type: 'b'}],
        },
      ],
    };
    expect(toolboxForSceneType(unrelated, 'story')).toBe(unrelated);
    expect(toolboxForSceneType(unrelated, undefined)).toBe(unrelated);
  });

  it('leaves a flyout alone', () => {
    const flyout = {
      kind: 'flyoutToolbox',
      contents: [{kind: 'block', type: 'say'}],
    };
    expect(toolboxForSceneType(flyout, 'story')).toBe(flyout);
  });

  it('gives a story scene nothing when only the other type is authored', () => {
    const platformOnly = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Platform',
          contents: [{kind: 'block', type: 'jump'}],
        },
      ],
    };
    expect(toolboxForSceneType(platformOnly, 'story')).toEqual({
      kind: 'flyoutToolbox',
      contents: [],
    });
  });

  it('handles a missing shared category', () => {
    const noLink = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Story',
          contents: [{kind: 'block', type: 'say'}],
        },
      ],
    };
    expect(toolboxForSceneType(noLink, 'story')).toEqual({
      kind: 'flyoutToolbox',
      contents: [{kind: 'block', type: 'say'}],
    });
  });
});
