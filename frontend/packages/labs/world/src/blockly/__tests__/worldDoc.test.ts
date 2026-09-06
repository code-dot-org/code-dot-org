// `world_doc` — a page of prose in the workspace, and what it compiles to.
//
// The block draws markdown and changes nothing about what runs, so the only
// thing it owes the compiler is a comment that cannot break the file it lands
// in. That is the whole of what is testable without a workspace: the drawing
// needs a browser, and `spikes/rule-surfaces/check-note.mjs` drives it there.

import {describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../../rules/stock';
import {buildDomainPalette} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';

/** The block definition the palette mints for a type. */
const definitionOf = (type: string) => {
  const metas = STOCK_RULES.map(rule =>
    parseRuleMeta(`rules/${rule.id}`, rule.contents),
  ).filter(Boolean);
  const {blocks} = buildDomainPalette(
    metas as never,
    {
      fileKind: 'rule',
    } as never,
  );
  return blocks.find(block => block.type === type);
};

/** What the generator writes for a note holding `markdown`. */
const emitted = (markdown: string): string => {
  const definition = definitionOf('world_doc') as unknown as {
    generator?: {javascript?: (block: unknown, gen: unknown) => string};
  };
  const javascript = definition?.generator?.javascript;
  if (!javascript) {
    throw new Error('world_doc has no javascript generator');
  }
  return javascript({getFieldValue: () => markdown}, {});
};

describe('a note in the generated code', () => {
  it('is one line comment per line of prose', () => {
    expect(emitted('# Title\n\nsomething it does')).toBe(
      '// # Title\n//\n// something it does\n',
    );
  });

  it('never opens a block comment, which prose would close early', () => {
    // `*/` turns up in prose the moment anybody writes about a comment, and a
    // block comment would end there — leaving the rest of the note as code.
    const code = emitted('close it with */ and see');

    expect(code).not.toContain('/*');
    expect(code).toBe('// close it with */ and see\n');
  });

  it('leaves no trailing space on an empty line', () => {
    // `// ` on its own is a line of trailing whitespace in every file this
    // lands in, which every linter in the building has an opinion about.
    expect(emitted('a\n\nb')).toBe('// a\n//\n// b\n');
  });

  it('says nothing at all for an empty note', () => {
    expect(emitted('')).toBe('//\n');
  });
});

describe('what the block is', () => {
  it('is offered where `note` is offered', () => {
    const metas = STOCK_RULES.map(rule =>
      parseRuleMeta(`rules/${rule.id}`, rule.contents),
    ).filter(Boolean);
    const {toolbox} = buildDomainPalette(
      metas as never,
      {
        fileKind: 'rule',
      } as never,
    );
    const drawer = (toolbox as Array<{name: string; blocks?: unknown[]}>).find(
      category => (category.blocks ?? []).includes('world_comment'),
    );

    expect(drawer?.blocks).toContain('world_doc');
  });

  it('chains like a statement, so it can sit anywhere a note can', () => {
    const definition = definitionOf('world_doc') as unknown as {
      previousStatement?: boolean;
      nextStatement?: boolean;
    };

    expect(definition?.previousStatement).toBe(true);
    expect(definition?.nextStatement).toBe(true);
  });
});
