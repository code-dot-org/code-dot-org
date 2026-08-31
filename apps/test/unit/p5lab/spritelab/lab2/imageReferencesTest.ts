import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {
  IMAGE_NAME_MAX_LENGTH,
  removeImageReferences,
  renameImageReferences,
  sanitizeImageName,
} from '@cdo/apps/p5lab/spritelab/lab2/imageReferences';
import {Sources} from '@cdo/apps/p5lab/spritelab/lab2/types';

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
    const sources: Sources = {
      source: workspaceWith([
        {
          type: 'gamelab_makeNewSpriteAnon',
          fields: {ANIMATION: '"cat"'},
          inputs: {
            LOCATION: {block: {type: 'x', fields: {COSTUME: '"cat"'}}},
          },
          next: {block: {type: 'y', fields: {IMG: '"cat"'}}},
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
    expect(top.next!.block.fields).toEqual({IMG: '"tiger"'});
    const scene = blocksOf(out.scenes![0].source)[0];
    expect(scene.fields).toEqual({ANIMATION: '"tiger"'});
  });

  it('leaves non-picker fields and other names alone', () => {
    const sources: Sources = {
      source: workspaceWith([
        {type: 'text', fields: {TEXT: '"up"'}},
        // Dropdowns elsewhere store quoted keywords too; an image named
        // after one must not rewrite them.
        {type: 'k', fields: {DIRECTION: '"up"', KEY: 'up'}},
        {type: 'a', fields: {ANIMATION: '"upland"'}},
        {type: 'b', fields: {ANIMATION: 'up'}},
      ]),
    };
    const out = renameImageReferences(sources, 'up', 'down');
    const blocks = blocksOf(out.source);
    expect(blocks[0].fields).toEqual({TEXT: '"up"'});
    expect(blocks[1].fields).toEqual({DIRECTION: '"up"', KEY: 'up'});
    expect(blocks[2].fields).toEqual({ANIMATION: '"upland"'});
    // Unquoted values are not image references.
    expect(blocks[3].fields).toEqual({ANIMATION: 'up'});
  });

  it('renames world grid cells and does not mutate the input', () => {
    const sources: Sources = {
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
});

describe('sanitizeImageName', () => {
  it('drops quotes, collapses whitespace, keeps a trailing space', () => {
    expect(sanitizeImageName('say "hi"')).toBe('say hi');
    expect(sanitizeImageName('  big   cat ')).toBe('big cat ');
  });

  it('caps the length', () => {
    expect(sanitizeImageName('x'.repeat(99))).toHaveLength(
      IMAGE_NAME_MAX_LENGTH
    );
  });
});

describe('SpriteLab2 removeImageReferences', () => {
  const sources = {
    source: {blocks: {blocks: []}},
    scenes: [
      {
        id: 's1',
        name: 'Story',
        source: {
          blocks: {
            blocks: [
              {
                type: 'gamelab_makeNewSpriteAnon',
                fields: {ANIMATION_NAME: '"wizard"'},
                next: {
                  block: {
                    type: 'gamelab_spriteSay',
                    fields: {SPEECH: 'wizard'},
                    inputs: {
                      SPRITE: {
                        shadow: {
                          type: 'gamelab_allSpritesWithAnimation',
                          fields: {ANIMATION: '"wizard"'},
                        },
                      },
                    },
                  },
                },
              },
              {
                type: 'gamelab_setBackgroundImageAs',
                fields: {IMAGE: '"forest"'},
              },
            ],
          },
        },
        world: {
          grid: [
            [
              {image: 'wizard', kind: 'sprite'},
              {image: 'stone', kind: 'block'},
            ],
            [null, {image: 'wizard', kind: 'sprite'}],
          ],
        },
      },
    ],
  } as unknown as Parameters<typeof removeImageReferences>[0];

  it('drops picker fields naming the image and clears its World cells, leaving the rest', () => {
    const out = removeImageReferences(sources, 'wizard');
    type Loose = {
      fields?: Record<string, string>;
      next?: {block: Loose};
      inputs?: Record<string, {shadow?: Loose; block?: Loose}>;
    };
    const blocks = (
      out.scenes![0].source as unknown as {blocks: {blocks: Loose[]}}
    ).blocks.blocks;
    expect(blocks[0].fields).toEqual({});
    expect(blocks[0].next!.block.fields).toEqual({SPEECH: 'wizard'});
    expect(blocks[0].next!.block.inputs!.SPRITE.shadow!.fields).toEqual({});
    expect(blocks[1].fields).toEqual({IMAGE: '"forest"'});
    expect(out.scenes![0].world!.grid).toEqual([
      [null, {image: 'stone', kind: 'block'}],
      [null, null],
    ]);
    // Pure: the input is untouched.
    expect(sources.scenes![0].world!.grid[0][0]).toEqual({
      image: 'wizard',
      kind: 'sprite',
    });
  });

  it('reads and rewrites the XML-wrapped form a workspace saves', () => {
    const wrapped = '<field name="ANIMATION_NAME">"wizard"</field>';
    const src = {
      source: {blocks: {blocks: []}},
      scenes: [
        {
          id: 's1',
          name: 'Story',
          source: {
            blocks: {
              blocks: [
                {type: 'a', fields: {ANIMATION_NAME: wrapped}},
                {type: 'b', fields: {ANIMATION_NAME: wrapped}},
              ],
            },
          },
        },
      ],
    } as unknown as Parameters<typeof removeImageReferences>[0];
    type Loose = {fields?: Record<string, string>};
    const blocksOf = (out: typeof src) =>
      (out.scenes![0].source as unknown as {blocks: {blocks: Loose[]}}).blocks
        .blocks;
    expect(blocksOf(removeImageReferences(src, 'wizard'))[0].fields).toEqual(
      {}
    );
    expect(
      blocksOf(renameImageReferences(src, 'wizard', 'mage'))[1].fields
    ).toEqual({ANIMATION_NAME: '<field name="ANIMATION_NAME">"mage"</field>'});
  });

  it('matches and writes XML-escaped names', () => {
    const wrapped = '<field name="ANIMATION_NAME">"cats &amp; dogs"</field>';
    const src = {
      source: {
        blocks: {
          blocks: [
            {type: 'a', fields: {ANIMATION_NAME: wrapped}},
            {type: 'b', fields: {ANIMATION_NAME: wrapped}},
          ],
        },
      },
    } as unknown as Parameters<typeof removeImageReferences>[0];
    type Loose = {fields?: Record<string, string>};
    const blocksOf = (out: typeof src) =>
      (out.source as unknown as {blocks: {blocks: Loose[]}}).blocks.blocks;
    expect(
      blocksOf(removeImageReferences(src, 'cats & dogs'))[0].fields
    ).toEqual({});
    expect(
      blocksOf(renameImageReferences(src, 'cats & dogs', 'cats < dogs'))[1]
        .fields
    ).toEqual({
      ANIMATION_NAME: '<field name="ANIMATION_NAME">"cats &lt; dogs"</field>',
    });
  });
});
