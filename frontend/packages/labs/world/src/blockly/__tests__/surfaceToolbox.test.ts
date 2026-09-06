// What each of a rule's two surfaces offers.
//
// The claim worth testing is not "the Rule drawer is shorter". It is that a
// declaration is gone from EVERY drawer that offered it — `define property` is
// in Actor, World and Rule — and that the blocks a body needs survive.

import {describe, expect, it} from 'vitest';

import type {Toolbox, ToolboxCategory} from '@code-dot-org/blockly';

import {STOCK_RULES} from '../../rules/stock';
import {buildDomainPalette} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';
import {toolboxForSurface} from '../surfaceToolbox';

/** The real thing: every stock rule's category, as the editor builds it. */
const palette = (): Toolbox => {
  const metas = STOCK_RULES.map(rule =>
    parseRuleMeta(`rules/${rule.id}`, rule.contents),
  ).filter(Boolean);
  return buildDomainPalette(metas as never, {fileKind: 'rule'} as never)
    .toolbox;
};

/** Every block type a toolbox offers, in whichever drawer. */
const offered = (toolbox: Toolbox): string[] =>
  (toolbox as ToolboxCategory[]).flatMap(category =>
    ((category.blocks ?? []) as unknown[]).map(entry =>
      typeof entry === 'string'
        ? entry
        : ((entry as {type?: string}).type ?? ''),
    ),
  );

const names = (toolbox: Toolbox): string[] =>
  (toolbox as ToolboxCategory[]).map(category => category.name);

describe('a body surface', () => {
  it('offers no declaration, in any drawer that offered one', () => {
    // `world_rule_property` is in Actor, World and Rule; `world_rule_block` in
    // Actor and Rule. A filter that only looked at the Rule category would
    // pass a test that only looked at the Rule category.
    const body = offered(toolboxForSurface(palette(), 'body'));

    for (const declaration of [
      'world_rule',
      'world_rule_property',
      'world_rule_block',
      'world_trait_step',
      'world_use_trait',
      'world_rule_step_in',
      'world_rule_event',
    ]) {
      expect(body, declaration).not.toContain(declaration);
    }
  });

  it('keeps what an implementation is written out of', () => {
    const body = offered(toolboxForSurface(palette(), 'body'));

    // The two that exist for bodies alone…
    expect(body).toContain('world_return');
    expect(body).toContain('world_step_delta');
    // …and the ordinary run of blocks a body is made of.
    expect(body).toContain('world_add_trait');
    expect(body).toContain('world_get_number_property');
    expect(body.length).toBeGreaterThan(100);
  });
});

describe('the interface', () => {
  it('offers the declarations', () => {
    const shown = offered(toolboxForSurface(palette(), 'interface'));

    expect(shown).toContain('world_rule_property');
    expect(shown).toContain('world_rule_block');
    expect(shown).toContain('world_rule_step_in');
  });

  it('does not offer what only a body can use', () => {
    // `return` reports from the query it is written in, and there is no query
    // on the interface — only the declaration of one.
    const shown = offered(toolboxForSurface(palette(), 'interface'));

    expect(shown).not.toContain('world_return');
    expect(shown).not.toContain('world_step_delta');
  });
});

describe('what filtering must not break', () => {
  const category = (name: string, blocks: unknown[]): ToolboxCategory =>
    ({name, blocks}) as ToolboxCategory;

  it('leaves an entry that is not a block alone', () => {
    // Labels, separators and the "How this works" button are entries too, and
    // they carry no type to judge.
    const toolbox = [
      category('Rule', [
        {kind: 'label', text: 'Declarations'},
        'world_rule_property',
        'world_return',
      ]),
    ] as Toolbox;

    expect(
      (toolboxForSurface(toolbox, 'body') as ToolboxCategory[])[0].blocks,
    ).toEqual([{kind: 'label', text: 'Declarations'}, 'world_return']);
  });

  it('drops a drawer with nothing left in it', () => {
    const toolbox = [
      category('Only Declarations', ['world_rule', 'world_rule_property']),
      category('Something', ['world_add_trait']),
    ] as Toolbox;

    expect(names(toolboxForSurface(toolbox, 'body'))).toEqual(['Something']);
  });

  it('keeps a drawer that fills itself when it is opened', () => {
    // A dynamic category's `blocks` is only its fixed part — Variables builds
    // the rest at open time — so an empty one is not an empty drawer.
    const dynamic = {
      name: 'Variables',
      key: 'VARIABLE',
      onLoad: () => [],
      blocks: ['world_rule_property'],
    } as unknown as ToolboxCategory;

    expect(names(toolboxForSurface([dynamic] as Toolbox, 'body'))).toEqual([
      'Variables',
    ]);
  });
});
