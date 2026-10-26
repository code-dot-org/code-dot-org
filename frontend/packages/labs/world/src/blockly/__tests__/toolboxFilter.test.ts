// Leaving categories out of the toolbox.
//
// What a level hides is the way IN — the blocks stay defined, because a
// workspace it ships with (or one a learner carries from an earlier level) has
// to keep rendering and keep generating code. These check the shape of that
// promise: the toolbox loses exactly what was named, and nothing else changes.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../domainBlocks';
import {withoutCategories, withoutEmptyHeadings} from '../toolboxFilter';
import {TOOLBOX_HEADING} from '../toolboxStyle';

const names = (toolbox: unknown) =>
  (toolbox as Array<{name: string}>).map(category => category.name);

describe('withoutCategories', () => {
  const {toolbox} = buildDomainPalette([]);

  it('leaves out the categories a level names', () => {
    const shown = names(withoutCategories(toolbox, ['Loops', 'Color']));
    expect(shown).not.toContain('Loops');
    expect(shown).not.toContain('Color');
    expect(shown).toContain('Actor');
    expect(shown).toHaveLength(names(toolbox).length - 2);
  });

  it('hands back the same toolbox when nothing is hidden', () => {
    // Identity, not just equality: the toolbox is a prop, and a fresh array
    // every render is a fresh prop every render.
    expect(withoutCategories(toolbox, [])).toBe(toolbox);
  });

  it('ignores a name no category has', () => {
    // A level may name a category this project has no rule for. That is not an
    // error; the toolbox is simply as it was.
    expect(names(withoutCategories(toolbox, ['Nothing At All']))).toEqual(
      names(toolbox),
    );
  });

  it('keeps every block defined', () => {
    // The point of hiding a category rather than dropping its blocks: a
    // workspace that already holds one still renders and still generates.
    const {blocks} = buildDomainPalette([]);
    const hidden = withoutCategories(toolbox, ['Loops']);
    const loops = (toolbox as Array<{name: string; blocks?: string[]}>).find(
      category => category.name === 'Loops',
    );
    expect(names(hidden)).not.toContain('Loops');
    for (const type of loops?.blocks ?? []) {
      expect(
        blocks.some(block => block.type === type) ||
          typeof type !== 'string' ||
          type.startsWith('controls_'),
        String(type),
      ).toBe(true);
    }
  });
});

describe('withoutEmptyHeadings', () => {
  /** A toolbox row list, headings written as `— Name —`. */
  const rows = (...names: string[]) =>
    names.map(name =>
      name.startsWith('—')
        ? {kind: TOOLBOX_HEADING, name: name.replaceAll('—', '').trim()}
        : {name, blocks: []},
    ) as unknown as Parameters<typeof withoutEmptyHeadings>[0];

  it('drops a heading whose group was filtered away', () => {
    // The case that made this necessary. A `.rule` is offered only the rules
    // it depends on (`rulesInScope`), and its own drawer is hoisted out of the
    // group — so a project of two rules leaves the Rules heading over nothing.
    expect(names(withoutEmptyHeadings(rows('Math', '— Rules —')))).toEqual([
      'Math',
    ]);
  });

  it('drops one whose group is empty because the next heading follows it', () => {
    expect(
      names(
        withoutEmptyHeadings(
          rows(
            'Math',
            '— Current —',
            'Spin',
            '— Rules —',
            '— Actors —',
            'Tapper',
          ),
        ),
      ),
    ).toEqual(['Math', 'Current', 'Spin', 'Actors', 'Tapper']);
  });

  it('keeps a heading that still has something under it', () => {
    // Identity, for the same reason `withoutCategories` hands back what it was
    // given: the toolbox is a prop.
    const kept = rows('Math', '— Rules —', 'Spin');
    expect(withoutEmptyHeadings(kept)).toBe(kept);
  });
});
