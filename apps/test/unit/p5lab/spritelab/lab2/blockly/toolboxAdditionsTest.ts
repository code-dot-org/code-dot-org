import {EFFECT_FIELD_DEFAULTS} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/playSoundEffect';
import {
  applyToolboxAdditions,
  withLeadingBlocks,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/toolboxAdditions';
import {
  BlockInfo,
  StaticCategoryInfo,
  ToolboxInfo,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/types';

function blocksIn(toolbox: ToolboxInfo, name: string): BlockInfo[] {
  const category = toolbox.contents.find(
    entry =>
      entry.kind === 'category' && (entry as StaticCategoryInfo).name === name
  ) as StaticCategoryInfo;
  return category.contents.filter(
    entry => entry.kind === 'block'
  ) as BlockInfo[];
}

describe('applyToolboxAdditions', () => {
  const authored: ToolboxInfo = {
    kind: 'categoryToolbox',
    contents: [{kind: 'category', name: 'Sprites', contents: []}],
  };

  it('starts the sound effect as a jump in both injected categories', () => {
    const toolbox = applyToolboxAdditions(authored);
    ['Platform', 'Story'].forEach(name => {
      const effect = blocksIn(toolbox, name).find(
        block => block.type === 'spritelab2_playSoundEffect'
      );
      expect(effect?.fields).toEqual(EFFECT_FIELD_DEFAULTS);
    });
  });

  it('gives grid blocks a marked grid and other blocks no fields', () => {
    const toolbox = applyToolboxAdditions(authored);
    const sprites = blocksIn(toolbox, 'Sprites');
    const player = sprites.find(
      block => block.type === 'spritelab2_makePlatformPlayer'
    );
    expect(player?.fields?.GRID).toMatch(/^\[\[/);
    const sound = blocksIn(toolbox, 'Platform').find(
      block => block.type === 'spritelab2_playSound'
    );
    expect(sound?.fields).toEqual({SOUND: 'synth://jump'});
    const music = blocksIn(toolbox, 'Platform').find(
      block => block.type === 'spritelab2_playMusic'
    );
    expect(music?.fields).toBeUndefined();
  });
});

describe('withLeadingBlocks', () => {
  it('puts the blocks first in a toolbox with no categories', () => {
    const toolbox: ToolboxInfo = {
      kind: 'flyoutToolbox',
      contents: [{kind: 'block', type: 'a'}],
    };
    expect(withLeadingBlocks(toolbox, ['lead']).contents).toEqual([
      {kind: 'block', type: 'lead'},
      {kind: 'block', type: 'a'},
    ]);
  });

  it('puts the blocks first in the first category', () => {
    const toolbox: ToolboxInfo = {
      kind: 'categoryToolbox',
      contents: [
        {kind: 'category', name: 'One', contents: [{kind: 'block', type: 'a'}]},
        {kind: 'category', name: 'Two', contents: [{kind: 'block', type: 'b'}]},
      ],
    };
    const out = withLeadingBlocks(toolbox, ['lead']);
    expect(blocksIn(out, 'One').map(b => b.type)).toEqual(['lead', 'a']);
    expect(blocksIn(out, 'Two').map(b => b.type)).toEqual(['b']);
    expect(blocksIn(toolbox, 'One').map(b => b.type)).toEqual(['a']);
  });
});
