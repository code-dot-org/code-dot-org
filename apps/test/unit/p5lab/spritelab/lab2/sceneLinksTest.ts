import {GO_TO_SCENE_BLOCK_TYPE} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/goToScene';
import {sceneLinks} from '@cdo/apps/p5lab/spritelab/lab2/sceneLinks';
import {Scene} from '@cdo/apps/p5lab/spritelab/lab2/types';

const goTo = (to: string) => ({
  type: GO_TO_SCENE_BLOCK_TYPE,
  fields: {SCENE: to},
});

const scene = (id: string, blocks: object[] = []): Scene => ({
  id,
  name: id,
  source: {blocks: {blocks}} as Scene['source'],
});

describe('SpriteLab2 sceneLinks', () => {
  it('links a scene to each scene its code jumps to, once', () => {
    const scenes = [
      scene('a', [
        {
          type: 'when_run',
          next: {block: goTo('b')},
        },
        {
          type: 'spritelab2_whenClicked',
          inputs: {DO: {block: {type: 'x', next: {block: goTo('c')}}}},
        },
        goTo('b'),
      ]),
      scene('b', [goTo('a')]),
      scene('c'),
    ];
    expect(sceneLinks(scenes)).toEqual([
      {from: 'a', to: 'b'},
      {from: 'a', to: 'c'},
      {from: 'b', to: 'a'},
    ]);
  });

  it('ignores a jump to itself, to a scene that is gone, and a scene with no code', () => {
    const scenes = [
      scene('a', [goTo('a'), goTo('zzz')]),
      {id: 'b', name: 'b'} as Scene,
    ];
    expect(sceneLinks(scenes)).toEqual([]);
  });
});
