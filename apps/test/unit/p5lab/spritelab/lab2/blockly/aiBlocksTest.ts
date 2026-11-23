import {withoutAiBlocks} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/aiBlocks';
import {ToolboxInfo} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/types';

describe('withoutAiBlocks', () => {
  it('removes AI blocks from every category, keeping the rest', () => {
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
        {
          kind: 'category',
          name: 'AI',
          contents: [{kind: 'block', type: 'gamelab_whenPromptAnswered'}],
        },
      ],
    });
  });

  it('removes a category left empty, whatever its name', () => {
    const toolbox: ToolboxInfo = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Chatbot',
          contents: [
            {kind: 'block', type: 'spritelab2_askAI'},
            {kind: 'block', type: 'spritelab2_askAIWithChoices'},
          ],
        },
        {kind: 'category', name: 'Variables', custom: 'VARIABLE'},
      ],
    };

    expect(withoutAiBlocks(toolbox)).toEqual({
      kind: 'categoryToolbox',
      contents: [{kind: 'category', name: 'Variables', custom: 'VARIABLE'}],
    });
  });
});
