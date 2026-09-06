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

describe('the Block drawer', () => {
  // What a `define block`'s signature is made of. It goes in the `arguments`
  // row on a body surface's head, and there is no such row anywhere else — so
  // offering it on the interface would be offering blocks with nowhere to go.
  it('is offered inside a body', () => {
    expect(names(toolboxForSurface(palette(), 'body'))).toContain('Block');
    expect(offered(toolboxForSurface(palette(), 'body'))).toContain(
      'world_signature_argument',
    );
  });

  it('is not offered on the interface, drawer and all', () => {
    expect(names(toolboxForSurface(palette(), 'interface'))).not.toContain(
      'Block',
    );
    expect(offered(toolboxForSurface(palette(), 'interface'))).not.toContain(
      'world_signature_argument',
    );
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

describe('an event surface', () => {
  // `define event` has a surface but no implementation. There is nowhere on it
  // to put a statement, so a full toolbox would be a wall of blocks that
  // cannot be used anywhere.
  it('offers one drawer and no more', () => {
    expect(names(toolboxForSurface(palette(), 'event'))).toEqual(['Block']);
  });

  it('drops even a drawer that fills itself when it is opened', () => {
    // Written after the first version of this passed with the fault in place.
    // Emptying the other drawers is not enough: a dynamic category keeps its
    // place when its static list runs out — deliberately, because what
    // `onLoad` will offer is not knowable — so Variables would stand open on a
    // surface with nowhere to put a variable.
    const dynamic = {
      name: 'Variables',
      key: 'VARIABLE',
      onLoad: () => [],
      blocks: [],
    } as unknown as ToolboxCategory;
    const signature = {
      name: 'Block',
      blocks: ['world_signature_choice'],
    } as ToolboxCategory;

    expect(
      names(toolboxForSurface([dynamic, signature] as Toolbox, 'event')),
    ).toEqual(['Block']);
    // …and it keeps its place everywhere else.
    expect(
      names(toolboxForSurface([dynamic, signature] as Toolbox, 'body')),
    ).toContain('Variables');
  });

  it('offers choices and wording, not the typed argument', () => {
    // An event's parameter is a FILTER, and a filter over "any number" is a
    // comparison rather than a hat.
    const shown = offered(toolboxForSurface(palette(), 'event'));

    expect(shown).toContain('world_signature_choice');
    expect(shown).toContain('world_signature_text');
    expect(shown).not.toContain('world_signature_argument');
  });

  it('is the other way round inside a body', () => {
    // A `define block` says the same thing by picking an enum in `argument`'s
    // type dropdown, so the choice item is the event's alone.
    const shown = offered(toolboxForSurface(palette(), 'body'));

    expect(shown).toContain('world_signature_argument');
    expect(shown).not.toContain('world_signature_choice');
  });
});
