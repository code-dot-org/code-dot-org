import {withoutAiBlocks} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/aiBlocks';
import {ToolboxInfo} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/types';

describe('withoutAiBlocks', () => {
  it('removes the AI category and AI blocks filed elsewhere', () => {
    const toolbox: ToolboxInfo = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Events',
          contents: [
            {kind: 'block', type: 'gamelab_whenPromptAnswered'},
            {kind: 'block', type: 'spritelab2_setSystemPrompt'},
          ],
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

    expect(withoutAiBlocks(toolbox)).toEqual({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Events',
          contents: [{kind: 'block', type: 'gamelab_whenPromptAnswered'}],
        },
      ],
    });
  });
});
