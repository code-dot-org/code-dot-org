import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {renameImageReferences} from '@cdo/apps/p5lab/spritelab/lab2/imageReferences';
import {SpriteLab2Source} from '@cdo/apps/p5lab/spritelab/lab2/types';

interface TestBlock {
  type?: string;
  fields?: Record<string, string>;
  inputs?: {[name: string]: {block: TestBlock}};
  next?: {block: TestBlock};
}

const workspaceWith = (blocks: TestBlock[]) =>
  ({blocks: {blocks}} as unknown as WorkspaceSerialization);

const blocksOf = (source: unknown): TestBlock[] =>
  (source as {blocks: {blocks: TestBlock[]}}).blocks.blocks;

describe('renameImageReferences', () => {
  it('renames quoted picker fields everywhere blocks nest', () => {
    const sources: SpriteLab2Source = {
      source: workspaceWith([
        {
          type: 'gamelab_makeNewSpriteAnon',
          fields: {ANIMATION: '"cat"'},
          inputs: {
            LOCATION: {block: {type: 'x', fields: {COSTUME: '"cat"'}}},
          },
          next: {block: {type: 'y', fields: {BACKGROUND: '"cat"'}}},
        },
      ]),
      scenes: [
        {
          id: 's1',
          name: 'Scene 1',
          source: workspaceWith([{type: 'z', fields: {ANIMATION: '"cat"'}}]),
        },
      ],
    };
    const out = renameImageReferences(sources, 'cat', 'tiger');
    const top = blocksOf(out.source)[0];
    expect(top.fields).toEqual({ANIMATION: '"tiger"'});
    expect(top.inputs!.LOCATION.block.fields).toEqual({COSTUME: '"tiger"'});
    expect(top.next!.block.fields).toEqual({BACKGROUND: '"tiger"'});
    const scene = blocksOf(out.scenes![0].source)[0];
    expect(scene.fields).toEqual({ANIMATION: '"tiger"'});
  });

  it('leaves TEXT fields and other names alone', () => {
    const sources: SpriteLab2Source = {
      source: workspaceWith([
        {type: 'text', fields: {TEXT: '"cat"'}},
        {type: 'a', fields: {ANIMATION: '"catalog"'}},
        {type: 'b', fields: {ANIMATION: 'cat'}},
      ]),
    };
    const out = renameImageReferences(sources, 'cat', 'tiger');
    const blocks = blocksOf(out.source);
    expect(blocks[0].fields).toEqual({TEXT: '"cat"'});
    expect(blocks[1].fields).toEqual({ANIMATION: '"catalog"'});
    // Unquoted values are not image references.
    expect(blocks[2].fields).toEqual({ANIMATION: 'cat'});
  });

  it('renames world grid cells and does not mutate the input', () => {
    const sources: SpriteLab2Source = {
      source: workspaceWith([]),
      scenes: [
        {
          id: 's1',
          name: 'Scene 1',
          world: {
            grid: [
              [{image: 'cat', kind: 'sprite'}, null],
              [null, {image: 'ice', kind: 'block'}],
            ],
          },
        },
      ],
    };
    const out = renameImageReferences(sources, 'cat', 'tiger');
    expect(out.scenes![0].world!.grid[0][0]).toEqual({
      image: 'tiger',
      kind: 'sprite',
    });
    expect(out.scenes![0].world!.grid[1][1]).toEqual({
      image: 'ice',
      kind: 'block',
    });
    expect(sources.scenes![0].world!.grid[0][0]).toEqual({
      image: 'cat',
      kind: 'sprite',
    });
  });

  it('handles names needing JSON escaping', () => {
    const sources: SpriteLab2Source = {
      source: workspaceWith([
        {type: 'a', fields: {ANIMATION: '"say \\"hi\\""'}},
      ]),
    };
    const out = renameImageReferences(sources, 'say "hi"', 'greeting');
    expect(blocksOf(out.source)[0].fields).toEqual({ANIMATION: '"greeting"'});
  });
});
