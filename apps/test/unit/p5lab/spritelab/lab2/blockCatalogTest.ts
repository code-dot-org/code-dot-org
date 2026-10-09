import {
  catalogEntries,
  heldBackBlockTypes,
  withoutBlockTypes,
} from '@cdo/apps/p5lab/spritelab/lab2/blockCatalog';
import {BLOCK_HELP} from '@cdo/apps/p5lab/spritelab/lab2/blockHelp/blockHelpContent';

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
