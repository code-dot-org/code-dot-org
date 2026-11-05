import {
  ToolboxInfo,
  withoutCategory,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/types';

describe('withoutCategory', () => {
  const toolbox: ToolboxInfo = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Events',
        contents: [{kind: 'block', type: 'gamelab_whenPromptAnswered'}],
      },
      {
        kind: 'category',
        name: 'AI',
        contents: [
          {kind: 'block', type: 'spritelab2_askAI'},
          {kind: 'block', type: 'gamelab_whenPromptAnswered'},
        ],
      },
    ],
  };

  it('removes the named category and everything in it', () => {
    expect(withoutCategory(toolbox, 'AI')).toEqual({
      kind: 'categoryToolbox',
      contents: [toolbox.contents[0]],
    });
  });

  it('leaves a toolbox without that category as it was', () => {
    expect(withoutCategory(toolbox, 'Math')).toEqual(toolbox);
  });
});
