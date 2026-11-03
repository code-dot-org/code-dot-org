import {
  catalogEntries,
  heldBackBlockTypes,
  newBlockTypes,
  offeredBlockTypes,
  requiredBlockTypes,
  withoutBlockTypes,
} from '@cdo/apps/p5lab/spritelab/lab2/blockCatalog';
import {BLOCK_HELP} from '@cdo/apps/p5lab/spritelab/lab2/blockHelp/blockHelpContent';
import {SpriteLab2LevelProperties} from '@cdo/apps/p5lab/spritelab/lab2/types';

const WITH_HELP = Object.keys(BLOCK_HELP)[0];

describe('catalogEntries', () => {
  it('keeps toolbox order and drops blocks without help', () => {
    const entries = catalogEntries(['no_help_block', WITH_HELP]);
    expect(entries.map(entry => entry.type)).toEqual([WITH_HELP]);
    expect(entries[0].help).toBe(BLOCK_HELP[WITH_HELP]);
  });

  it('is empty without new blocks', () => {
    expect(catalogEntries(undefined)).toEqual([]);
  });
});

describe('heldBackBlockTypes', () => {
  it('is the catalog less the chosen blocks', () => {
    const entries = catalogEntries([WITH_HELP]);
    expect([...heldBackBlockTypes(entries, undefined)]).toEqual([WITH_HELP]);
    expect([...heldBackBlockTypes(entries, [WITH_HELP])]).toEqual([]);
  });
});

describe('withoutBlockTypes', () => {
  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Platform',
        contents: [
          {kind: 'block', type: 'jump'},
          {kind: 'block', type: 'zoom'},
        ],
      },
      {
        kind: 'category',
        name: 'Link',
        contents: [{kind: 'block', type: 'goTo'}],
      },
    ],
  };

  it('removes the named blocks inside categories', () => {
    expect(withoutBlockTypes(toolbox, new Set(['zoom']))).toEqual({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Platform',
          contents: [{kind: 'block', type: 'jump'}],
        },
        {
          kind: 'category',
          name: 'Link',
          contents: [{kind: 'block', type: 'goTo'}],
        },
      ],
    });
  });

  it('removes them from a flat flyout', () => {
    const flyout = {
      kind: 'flyoutToolbox',
      contents: [
        {kind: 'block', type: 'jump'},
        {kind: 'block', type: 'zoom'},
      ],
    };
    expect(withoutBlockTypes(flyout, new Set(['jump', 'zoom']))).toEqual({
      kind: 'flyoutToolbox',
      contents: [],
    });
  });

  it('returns the toolbox itself when nothing is hidden', () => {
    expect(withoutBlockTypes(toolbox, new Set())).toBe(toolbox);
  });
});

const toolbox = (...types: string[]) =>
  ({
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Platform',
        contents: types.map(type => ({
          kind: 'block',
          type,
          inputs: {
            SPRITE: {shadow: {type: 'gamelab_allSpritesWithAnimation'}},
          },
        })),
      },
    ],
  } as SpriteLab2LevelProperties['toolboxDefinition']);
const level = (
  props: Partial<SpriteLab2LevelProperties>
): SpriteLab2LevelProperties =>
  ({
    id: 1,
    name: 'level',
    appName: 'spritelab',
    ...props,
  } as SpriteLab2LevelProperties);

describe('offeredBlockTypes', () => {
  it('is the toolbox blocks, not their shadows or categories', () => {
    expect(
      offeredBlockTypes(
        level({
          toolboxDefinition: toolbox('gamelab_spriteSay', 'spritelab2_burst'),
        })
      )
    ).toEqual(['gamelab_spriteSay', 'spritelab2_burst']);
  });

  it('counts the blocks add_blocks places, not their placeholders', () => {
    expect(
      offeredBlockTypes(
        level({
          toolboxDefinition: toolbox('spritelab2_burst'),
          addBlocks: [
            {
              type: 'gamelab_atTime',
              next: {shadow: {type: 'spritelab2_placeholder'}},
            },
            {
              attachTo: 'spritelab2_whenRun',
              shadow: {type: 'spritelab2_placeholder'},
            },
          ],
        })
      )
    ).toEqual(['spritelab2_burst', 'gamelab_atTime']);
  });

  it('does not take a type inside a field or extra state for a block', () => {
    expect(
      offeredBlockTypes(
        level({
          toolboxDefinition: {
            kind: 'flyoutToolbox',
            contents: [
              {
                kind: 'block',
                type: 'gamelab_setProp',
                fields: {PROP: '"type"'},
              },
              {
                kind: 'block',
                type: 'spritelab2_placeholder',
                extraState: {like: {type: 'gamelab_spriteSay'}},
              },
            ],
          } as SpriteLab2LevelProperties['toolboxDefinition'],
        })
      )
    ).toEqual(['gamelab_setProp', 'spritelab2_placeholder']);
  });

  it('is empty without a toolbox', () => {
    expect(offeredBlockTypes(level({}))).toEqual([]);
  });
});

describe('newBlockTypes', () => {
  it('requires what a checklist item names, hangs under or placed, not any-of options', () => {
    const required = requiredBlockTypes(
      level({
        objectives: {
          items: [
            {
              text: 'say',
              check: {
                kind: 'block',
                type: 'gamelab_spriteSay',
                under: 'spritelab2_whenRun',
              },
            },
            {
              text: 'any',
              check: {
                kind: 'block',
                type: ['spritelab2_burst', 'spritelab2_setCameraZoom'],
              },
            },
            {text: 'play', check: {kind: 'play'}},
          ],
        },
        addBlocks: [
          {type: 'gamelab_checkTouching', data: 'treasure'},
          {
            attachTo: 'spritelab2_whenRun',
            shadow: {type: 'spritelab2_placeholder'},
          },
        ],
      })
    );
    expect(required).toEqual([
      'gamelab_spriteSay',
      'spritelab2_whenRun',
      'gamelab_checkTouching',
    ]);
  });

  it('is what no earlier level required, in toolbox order', () => {
    const first = level({
      toolboxDefinition: toolbox('gamelab_spriteSay'),
      objectives: {
        items: [
          {text: 'say', check: {kind: 'block', type: 'gamelab_spriteSay'}},
        ],
      },
    });
    // Offered, with the checklist taking either: neither is required.
    const second = level({
      toolboxDefinition: toolbox(
        'spritelab2_burst',
        'spritelab2_setCameraZoom'
      ),
      objectives: {
        items: [
          {
            text: 'any',
            check: {
              kind: 'block',
              type: ['spritelab2_burst', 'spritelab2_setCameraZoom'],
            },
          },
        ],
      },
    });
    const last = level({
      toolboxDefinition: toolbox(
        'gamelab_spriteSay',
        'spritelab2_burst',
        'spritelab2_setCameraZoom',
        'spritelab2_setWeather'
      ),
    });
    expect(newBlockTypes(last, [first, second])).toEqual([
      'spritelab2_burst',
      'spritelab2_setCameraZoom',
      'spritelab2_setWeather',
    ]);
  });
});
