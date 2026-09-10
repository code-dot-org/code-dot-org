// Where the rules sit in the toolbox, and what divides them from the rest.
//
// The strip is in two halves. Above the heading is what a learner has in EVERY
// project — the definition roots, the loop, the list, the arithmetic, and the
// engine's own `Space` and `Appearance` — which is the same list in the same
// order whatever has been imported. Below it is what THIS project imported,
// which is a different list per project and grows as one is built.
//
// They used to be interleaved, and the cost was paid by the half that never
// changes: `Math` moved down the strip every time a rule was imported, so it
// was somewhere different in each of two lessons and somewhere different again
// after a learner added a mechanic. A menu you have to re-find is a menu you
// stop reading.
//
// ORDER IS NOT SOMETHING A RENDER TEST CAN SEE CHEAPLY, and this file is why
// there is one at this level: the toolbox is an array long before it is DOM,
// and the array is where the decision is.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {mouseRule} from '../../rules/stock';
import {projectFiles} from '../../runtime/projectFiles';
import {buildDomainPalette, DOMAIN_TOOLBOX} from '../domainBlocks';
import {parseWorldOwnMeta} from '../ownProperties';
import {projectOwnMetas, projectRuleMetas} from '../projectModules';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {TOOLBOX_HEADING} from '../toolboxStyle';

/** A row's name, with the heading marked so a reader can see the break. */
const shape = (toolbox: unknown): string[] =>
  (toolbox as Array<{name?: string; kind?: string}>).map(row =>
    row.kind === TOOLBOX_HEADING ? `— ${row.name} —` : (row.name ?? '?'),
  );

const headingAt = (toolbox: unknown): number =>
  (toolbox as Array<{kind?: string}>).findIndex(
    row => row.kind === TOOLBOX_HEADING,
  );

/**
 * The engine's own rules. Rule categories by construction, always-available
 * ones by nature — a position is not something a rule can invent
 * (`builtinMeta`), so they sit with `Math` and not with the imports.
 */
const BUILTIN_RULE_NAMES = ['Space', 'Appearance'];

describe('the toolbox', () => {
  it('has no heading when the project has no rules to put under one', () => {
    // A label for a list that is not there. `DOMAIN_TOOLBOX` is the constant
    // handed back when nothing has been imported, so this is the empty case.
    expect(headingAt(DOMAIN_TOOLBOX)).toBe(-1);
    expect(shape(DOMAIN_TOOLBOX)).toContain('Actor');
    expect(shape(DOMAIN_TOOLBOX)).toContain('Math');
    // …and the engine's rules are there, above where a heading would go.
    for (const name of BUILTIN_RULE_NAMES) {
      expect(shape(DOMAIN_TOOLBOX)).toContain(name);
    }
  });

  it('divides the always-there from this project’s, once there are some', () => {
    // The case that matters, because the second list is the one that grows. A
    // rule imported into a project must not push `Math` down the strip.
    const meta = parseRuleMeta('rules/mouse', mouseRule)!;
    registerProjectRules([meta]);
    const {toolbox} = buildDomainPalette([meta], {fileKind: 'actor'});
    const rows = shape(toolbox);
    const at = headingAt(toolbox);
    const above = rows.slice(0, at);
    const below = rows.slice(at + 1);

    expect(
      (toolbox as Array<{kind?: string}>).filter(
        row => row.kind === TOOLBOX_HEADING,
      ),
    ).toHaveLength(1);
    // The two ends of the always-there half: what a learner opens to declare
    // something, and what they open to add up two numbers.
    expect(above).toContain('Actor');
    expect(above).toContain('Math');
    expect(above).toContain('Variables');
    // …the engine's rules with them, because they are always there too.
    for (const name of BUILTIN_RULE_NAMES) {
      expect(above).toContain(name);
      expect(below).not.toContain(name);
    }
    // …and this project's own on the other side.
    expect(below).toEqual([meta.name]);
  });

  it('keeps `Engine` with the language, not with the rules', () => {
    // It is offered only while writing a `.rule` and holds the primitives a
    // rule needs to do what the engine used to do for it — one of the
    // language's own categories, and it used to be appended after everything.
    const meta = parseRuleMeta('rules/mouse', mouseRule)!;
    registerProjectRules([meta]);
    const {toolbox} = buildDomainPalette([meta], {
      fileKind: 'rule',
      ownRuleModule: 'rules/mouse',
    });
    const rows = shape(toolbox);
    const at = headingAt(toolbox);

    expect(rows).toContain('Engine');
    expect(rows.indexOf('Engine')).toBeLessThan(at);
  });

  it('says the heading is not a category, so nothing walks into it', () => {
    // Everything that filters the toolbox reads `.name` or `.blocks`, and a
    // row with neither is what broke three tests the moment this was added.
    // The `kind` is how each of them tells the difference — the toolbox filter,
    // the surface toolbox, and Blockly's own conversion all key off it.
    const meta = parseRuleMeta('rules/mouse', mouseRule)!;
    registerProjectRules([meta]);
    const {toolbox} = buildDomainPalette([meta], {fileKind: 'actor'});
    const heading = (toolbox as Array<{kind?: string; blocks?: unknown}>)[
      headingAt(toolbox)
    ];

    expect(heading.kind).toBe(TOOLBOX_HEADING);
    expect(heading.blocks).toBeUndefined();
  });
});

describe('the drawer for the file being edited', () => {
  const files = projectFiles(WORLD_SCENARIOS.simple.source);
  const rules = projectRuleMetas(files);
  const own = projectOwnMetas(files);

  /** A rule the starter holds as a file of its own, so it has a module. */
  const aRule = () => rules.find(rule => rule.modulePath)!;

  it('is hoisted out of the rules, under a Current heading', () => {
    // Writing Gravity means reaching for Gravity's own properties over and
    // over. Left among the imports it is somewhere different in every file;
    // hoisted, it is in the same place in all of them — the argument the
    // Rules heading already makes one level up.
    const rule = aRule();
    const rows = shape(
      buildDomainPalette(rules, {
        fileKind: 'rule',
        ownRuleModule: rule.modulePath,
        ownProperties: own,
      }).toolbox,
    );

    expect(rows[rows.indexOf('— Current —') + 1]).toBe(rule.name);
    expect(rows.indexOf('— Current —')).toBeLessThan(rows.indexOf('— Rules —'));
    // …and still below the language's own half, which nothing moves.
    expect(rows.indexOf('Math')).toBeLessThan(rows.indexOf('— Current —'));
  });

  it('is lifted rather than copied, so it is offered once', () => {
    const rule = aRule();
    const rows = shape(
      buildDomainPalette(rules, {
        fileKind: 'rule',
        ownRuleModule: rule.modulePath,
        ownProperties: own,
      }).toolbox,
    );

    expect(rows.filter(row => row === rule.name)).toHaveLength(1);
    expect(rows.slice(rows.indexOf('— Rules —'))).not.toContain(rule.name);
  });

  it('is an actor’s drawer when an actor is what is open', () => {
    // The same lift, one heading down: the actor being edited comes out of the
    // Actors list, and the actors it shares the project with stay in it.
    const actor = own.find(meta => meta.name === 'Health Bar')!;
    const rows = shape(
      buildDomainPalette(rules, {
        fileKind: 'actor',
        ownProperties: own,
        ownActorModule: actor.modulePath,
      }).toolbox,
    );

    expect(rows[rows.indexOf('— Current —') + 1]).toBe('Health Bar');
    expect(rows.slice(rows.indexOf('— Actors —'))).not.toContain('Health Bar');
    expect(rows.filter(row => row === 'Health Bar')).toHaveLength(1);
  });

  it('is nothing at all for a world that declares no state of its own', () => {
    // The starter's world remembers nothing, so it has no drawer to hoist —
    // and neither has the headless generator, which has no one file.
    const rows = shape(
      buildDomainPalette(rules, {fileKind: 'world', ownProperties: own})
        .toolbox,
    );

    expect(rows).not.toContain('— Current —');
    expect(rows).toContain('— Rules —');
  });

  it('is the world’s own drawer when the world is what is open', () => {
    // A world that remembers a number gets a drawer for it exactly as an actor
    // does (specs/WORLD_STATE.md) — and both arrive in `ownProperties`, so it
    // used to land under the Actors heading, which a world is not. Open, it is
    // the drawer being worked in.
    const world = parseWorldOwnMeta(
      'worlds/main',
      JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_world',
              fields: {NAME: 'Tapper'},
              next: {
                block: {
                  type: 'world_rule_property',
                  fields: {
                    TYPE: 'number',
                    ACCESS: 'writable',
                    NAME: 'score',
                    DEFAULT: '0',
                  },
                },
              },
            },
          ],
        },
      }),
    )!;
    const rows = shape(
      buildDomainPalette(rules, {
        fileKind: 'world',
        // Replacing the starter's own entry for that module, not sitting
        // beside it: two metas for one path are two drawers reading one
        // declaration list, which is not a shape a project can be in.
        ownProperties: [
          ...own.filter(meta => meta.modulePath !== 'worlds/main'),
          world,
        ],
        ownWorldModule: 'worlds/main',
      }).toolbox,
    );

    expect(rows[rows.indexOf('— Current —') + 1]).toBe('Tapper');
    expect(rows.slice(rows.indexOf('— Actors —'))).not.toContain('Tapper');
  });

  it('wears a picture of THIS file rather than of a kind of file', () => {
    // The scroll and the masks below already say which kind; this one says
    // which file, so it is a page with a pen on it and neither of those.
    const rule = aRule();
    const headings = (
      buildDomainPalette(rules, {
        fileKind: 'rule',
        ownRuleModule: rule.modulePath,
        ownProperties: own,
      }).toolbox as Array<{kind?: string; name?: string; icon?: string}>
    ).filter(row => row.kind === TOOLBOX_HEADING);

    expect(headings[0]).toMatchObject({name: 'Current', icon: 'file-pen'});
  });
});

describe('an actor’s own blocks', () => {
  /** The starter, whose Health Bar declares `subject` and nothing else does. */
  const starter = () => {
    const files = projectFiles(WORLD_SCENARIOS.simple.source);
    return buildDomainPalette(projectRuleMetas(files), {
      fileKind: 'actor',
      ownProperties: projectOwnMetas(files),
    }).toolbox as Array<{name?: string; kind?: string; blocks?: unknown[]}>;
  };

  it('get a drawer named after the actor, under an Actors heading', () => {
    // A block is found in the drawer named after the thing that declared it,
    // which is why every rule has one. An actor's own get and set used to be
    // spliced into the general Actor drawer, among forty blocks about actors
    // in general, with nothing saying which actor they came from.
    const rows = shape(starter());
    const at = rows.indexOf('— Actors —');

    expect(at).toBeGreaterThan(0);
    expect(rows.slice(at + 1)).toContain('Health Bar');
    // …below the rules, which are below the language.
    expect(rows.indexOf('— Rules —')).toBeLessThan(at);
  });

  it('holds what that actor declared and what it acts like, and Actor holds neither', () => {
    const cats = starter();
    const drawer = cats.find(category => category.name === 'Health Bar');
    const general = cats.find(category => category.name === 'Actor');

    // Its own first, then the Progress Bar's — a Health Bar ACTS LIKE one, and
    // a learner looking in its drawer for the thing that fills a bar should
    // find it there rather than having to know where it came from. The same
    // blocks, not a second minting: a type carries the file that declared it.
    expect(drawer?.blocks).toEqual([
      'world_set_ActorsHealthBar_SubjectProperty',
      'world_get_ActorsHealthBar_SubjectProperty',
      'world_set_ActorsProgressBar_FractionProperty',
      'world_get_ActorsProgressBar_FractionProperty',
      'world_set_ActorsProgressBar_BarColorProperty',
      'world_get_ActorsProgressBar_BarColorProperty',
      'world_set_ActorsProgressBar_TrackColorProperty',
      'world_get_ActorsProgressBar_TrackColorProperty',
    ]);
    // AND THE GENERAL PAIR IS GONE from Actor. `get ⟨property ▾⟩ of ⟨actor⟩`
    // was twelve blocks, one get and one set per kind, each opening a dropdown
    // of every actor-scoped property in the project — there because an actor
    // had no drawer of its own to name them in. It has one now, so they were
    // twelve ways of saying what a named block already says, at the top of the
    // drawer a learner opens first.
    expect(
      (general?.blocks ?? []).filter(type =>
        String(type).includes('ActorsHealthBar'),
      ),
    ).toEqual([]);
    expect(general?.blocks).not.toContain('world_get_number_property');
    expect(general?.blocks).not.toContain('world_set_actor_property');
    expect(general?.blocks).toContain('world_use_trait');
  });

  it('gives no drawer, and no heading, to a project whose actors declare nothing', () => {
    // Most do not. A drawer each regardless is a list of empty rooms, and a
    // heading over no drawers is a label for something that is not there.
    //
    // SOKOBAN, and it used to be the jetpack — which now holds a Progress Bar,
    // and a Progress Bar declares the fraction and the two colors it is drawn
    // from. Those were a rule with no behavior in it.
    const files = projectFiles(WORLD_SCENARIOS.sokoban.source);
    const rows = shape(
      buildDomainPalette(projectRuleMetas(files), {
        fileKind: 'actor',
        ownProperties: projectOwnMetas(files),
      }).toolbox,
    );

    expect(rows).not.toContain('— Actors —');
  });

  it('puts each heading’s own file icon beside it', () => {
    // One picture per kind of thing: the scroll over the rules is the scroll
    // on a `.rule` tab, and the masks over the actors are an `.actor`'s
    // (`worldConfig.fileIcons`). Read off the config so the two cannot drift.
    const headings = (
      starter() as Array<{kind?: string; name?: string; icon?: string}>
    ).filter(row => row.kind === TOOLBOX_HEADING);

    expect(headings.map(row => [row.name, row.icon])).toEqual([
      ['Rules', 'scroll'],
      ['Actors', 'masks-theater'],
    ]);
  });
});
