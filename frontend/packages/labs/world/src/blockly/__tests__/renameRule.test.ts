// Renaming a rule carries to everything that names it.
//
// The reference format has no room for a file, so a rule's name is the only
// handle anything has on it — and renaming one is therefore an edit to every
// file that refers to it. What is checked here is the two halves of that: every
// shape a reference takes gets rewritten, and nothing that merely says the same
// word does.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT, starterFile} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {projectRuleMetas} from '../projectModules';
import {
  duplicateMemberKeys,
  memberKeys,
  renameMemberInSource,
  renameMemberReferences,
  renamedMember,
  renameRuleInSource,
  renameRuleReferences,
  type MemberKey,
} from '../renameRule';
import {parseRuleMeta} from '../ruleMeta';

const workspace = (...blocks: unknown[]) =>
  JSON.stringify({blocks: {blocks}}, null, 2);

const renamed = (contents: string, from = 'Gravity', to = 'Moon Gravity') =>
  JSON.parse(renameRuleReferences(contents, from, to) ?? contents) as {
    blocks: {blocks: Array<Record<string, never>>};
  };

describe('renameRuleReferences', () => {
  it('renames what a world puts in play', () => {
    const [use] = renamed(
      workspace({type: 'world_use_rule', fields: {RULE: 'Gravity'}}),
    ).blocks.blocks;
    expect(use.fields).toEqual({RULE: 'Moon Gravity'});
  });

  it('renames the rule half of a trait, event, and step reference', () => {
    const {blocks} = renamed(
      workspace(
        {type: 'world_use_trait', fields: {TRAIT: 'Gravity#AffectedTrait'}},
        {type: 'world_emit', fields: {EVENT: 'Gravity#StartsFallingEvent'}},
        {type: 'world_rule_step_after', fields: {STEP: 'Gravity#land'}},
      ),
    ).blocks;
    expect(blocks.map(b => b.fields)).toEqual([
      {TRAIT: 'Moon Gravity#AffectedTrait'},
      {EVENT: 'Moon Gravity#StartsFallingEvent'},
      {STEP: 'Moon Gravity#land'},
    ]);
  });

  it('renames the member block types built from the name', () => {
    // A block's type is a registry key, so it carries the name with the
    // punctuation taken out — and a saved workspace holds types, not metadata.
    const {blocks} = renamed(
      workspace(
        {type: 'world_get_Gravity_StrengthProperty'},
        {type: 'world_on_Gravity_StartsFallingEvent'},
        {type: 'world_query_Gravity_IsOnTheGroundQuery'},
      ),
    ).blocks;
    expect(blocks.map(b => b.type)).toEqual([
      'world_get_MoonGravity_StrengthProperty',
      'world_on_MoonGravity_StartsFallingEvent',
      'world_query_MoonGravity_IsOnTheGroundQuery',
    ]);
  });

  it('reaches a reference wherever it hangs in the tree', () => {
    // Nested under an input, a shadow, and a `next` chain — the places a block
    // actually lives, none of which the walk is allowed to care about.
    const {blocks} = renamed(
      workspace({
        type: 'world_rule_step_tick',
        next: {block: {type: 'world_use_trait', fields: {TRAIT: 'Gravity#T'}}},
        inputs: {
          VALUE: {
            block: {type: 'world_get_Gravity_StrengthProperty'},
            shadow: {type: 'world_query_Gravity_IsOnTheGroundQuery'},
          },
        },
      }),
    ).blocks;
    const [root] = blocks as unknown as Array<{
      next: {block: {fields: object}};
      inputs: {VALUE: {block: {type: string}; shadow: {type: string}}};
    }>;
    expect(root.next.block.fields).toEqual({TRAIT: 'Moon Gravity#T'});
    expect(root.inputs.VALUE.block.type).toBe(
      'world_get_MoonGravity_StrengthProperty',
    );
    expect(root.inputs.VALUE.shadow.type).toBe(
      'world_query_MoonGravity_IsOnTheGroundQuery',
    );
  });

  it('leaves alone everything that merely says the same word', () => {
    // The rename is structural for exactly this reason: "Gravity" is ordinary
    // English, and a learner's message, an actor's name, and another rule's
    // member are none of them references to this rule.
    const contents = workspace(
      {type: 'world_log', fields: {TEXT: 'Gravity is what pulls you down'}},
      {type: 'world_actor', fields: {NAME: 'Gravity'}},
      {type: 'world_get_Gravityish_StrengthProperty'},
      {type: 'world_use_rule', fields: {RULE: 'Gravity Well'}},
      {type: 'world_use_trait', fields: {TRAIT: 'Antigravity#T'}},
    );
    expect(renameRuleReferences(contents, 'Gravity', 'Moon Gravity')).toBe(
      undefined,
    );
  });

  it('says nothing changed rather than rewriting a file it did not touch', () => {
    expect(renameRuleReferences(workspace(), 'Gravity', 'X')).toBe(undefined);
    // A file mid-edit is not JSON, and is left exactly as it is.
    expect(renameRuleReferences('not json yet', 'Gravity', 'X')).toBe(
      undefined,
    );
  });
});

describe('renameRuleInSource', () => {
  const source = DEFAULT_PROJECT.source;

  it('rewrites every workspace that refers to the rule, and no others', () => {
    const next = renameRuleInSource(source, 'Gravity', 'Moon Gravity');
    const touched = Object.keys(next.files).filter(
      id => next.files[id].contents !== source.files[id].contents,
    );
    // The world attaches it, the player elects its trait and handles its events,
    // and the rule file itself is full of its own members.
    expect(new Set(touched.map(id => next.files[id].name))).toEqual(
      new Set(['main.world', 'player.actor', 'gravity.rule']),
    );
  });

  it('leaves a `.js` file alone — it imports a module, not a name', () => {
    // `actors/ground.js` reads `import {ActsAsGroundTrait} from 'rules/gravity'`.
    // The file did not move, so that import is as true after the rename as
    // before; a rename that touched it would be a rename of the wrong thing.
    const next = renameRuleInSource(source, 'Gravity', 'Moon Gravity');
    const ground = starterFile('ground').id;
    expect(next.files[ground].contents).toBe(source.files[ground].contents);
  });

  it('leaves the project resolvable — the rule answers to its new name', () => {
    const next = renameRuleInSource(source, 'Gravity', 'Moon Gravity');
    const metas = projectRuleMetas(projectFiles(next));
    expect(metas.map(meta => meta.name)).toContain('Moon Gravity');
    expect(metas.map(meta => meta.name)).not.toContain('Gravity');
    // And what named it now names it by the new name, at the same module.
    const gravity = parseRuleMeta(
      'rules/gravity',
      next.files[starterFile('gravityRule').id].contents,
    )!;
    expect(gravity.modulePath).toBe('rules/gravity');
    const arrows = parseRuleMeta(
      'rules/arrows',
      next.files[starterFile('arrowsRule').id].contents,
    )!;
    expect(arrows.requires).not.toContain('Gravity');
  });

  it('hands back the same source when nothing named the rule', () => {
    expect(renameRuleInSource(source, 'Nothing', 'Something')).toBe(source);
  });
});

// ── Members ─────────────────────────────────────────────────────────────────
// A member is referred to by the export name its own name derives, so renaming
// a trait, a property, an event, a step or a designed block's wording is the
// same kind of edit as renaming the rule — and is worked out the same way,
// except that what was edited is not what says so. The rule's members before
// and after are compared, because the edits that rename one are various (a NAME
// field, a label typed into a mutator) and their only common ground is the
// result.

describe('renameMemberReferences', () => {
  const contents = workspace(
    {type: 'world_use_trait', fields: {TRAIT: 'Gravity#AffectedTrait'}},
    {type: 'world_get_Gravity_StrengthProperty'},
    {type: 'world_rule_step_after', fields: {STEP: 'Gravity#land'}},
    // Another rule's member of the same name, and this rule's other members.
    {type: 'world_get_Wind_StrengthProperty'},
    {type: 'world_use_trait', fields: {TRAIT: 'Wind#StrengthProperty'}},
    {type: 'world_get_Gravity_DirectionProperty'},
  );

  it('renames a member of the named rule, and only there', () => {
    const {blocks} = JSON.parse(
      renameMemberReferences(
        contents,
        'Gravity',
        'StrengthProperty',
        'PowerProperty',
      )!,
    ).blocks as {blocks: Array<{type: string; fields?: object}>};
    expect(blocks.map(b => b.type)).toEqual([
      'world_use_trait',
      'world_get_Gravity_PowerProperty',
      'world_rule_step_after',
      'world_get_Wind_StrengthProperty', // a different rule's, left alone
      'world_use_trait',
      'world_get_Gravity_DirectionProperty',
    ]);
    expect(blocks[4].fields).toEqual({TRAIT: 'Wind#StrengthProperty'});
  });

  it('renames a trait and a step where they are named', () => {
    const trait = JSON.parse(
      renameMemberReferences(
        contents,
        'Gravity',
        'AffectedTrait',
        'PulledTrait',
      )!,
    ).blocks.blocks[0] as {fields: object};
    expect(trait.fields).toEqual({TRAIT: 'Gravity#PulledTrait'});
    const step = JSON.parse(
      renameMemberReferences(contents, 'Gravity', 'land', 'settle')!,
    ).blocks.blocks[2] as {fields: object};
    expect(step.fields).toEqual({STEP: 'Gravity#settle'});
  });

  it('leaves the rule itself, and a member nothing refers to, alone', () => {
    expect(
      renameMemberReferences(contents, 'Gravity', 'NobodysProperty', 'X'),
    ).toBe(undefined);
  });

  it('carries a member rename across the project', () => {
    // Gravity's `starts falling` is handled by the player, whose hat block is
    // that event's type — a file away from the rule that declares it.
    const next = renameMemberInSource(
      DEFAULT_PROJECT.source,
      'Gravity',
      'StartsFallingEvent',
      'BeginsFallingEvent',
    );
    const player = next.files[starterFile('player').id];
    expect(player.contents).toContain('world_on_Gravity_BeginsFallingEvent');
    expect(player.contents).not.toContain('StartsFallingEvent');
  });
});

describe('what changed between two states of a rule', () => {
  const key = (k: string, kind: MemberKey['kind']) => ({key: k, kind});

  it('reads one key gone and one arrived as a rename', () => {
    expect(
      renamedMember(
        [key('StrengthProperty', 'property'), key('AffectedTrait', 'trait')],
        [key('PowerProperty', 'property'), key('AffectedTrait', 'trait')],
      ),
    ).toEqual({from: 'StrengthProperty', to: 'PowerProperty'});
  });

  it('is not a rename when a member was added or deleted', () => {
    const before = [key('StrengthProperty', 'property')];
    expect(
      renamedMember(before, [...before, key('DragProperty', 'property')]),
    ).toBeUndefined();
    expect(renamedMember(before, [])).toBeUndefined();
    expect(renamedMember(before, before)).toBeUndefined();
  });

  it('is not a rename when two members changed at once', () => {
    // Guessing which became which would rewrite references to the wrong member.
    expect(
      renamedMember(
        [key('AProperty', 'property'), key('BProperty', 'property')],
        [key('CProperty', 'property'), key('DProperty', 'property')],
      ),
    ).toBeUndefined();
  });

  it('is not a rename when a block changed what it reports', () => {
    // `define block` switched from doing something to reporting something: the
    // key leaves as an action's and arrives as a query's, and no rewrite of the
    // call sites is possible — a reporter cannot go where a statement went.
    expect(
      renamedMember([key('PushAction', 'action')], [key('PushQuery', 'query')]),
    ).toBeUndefined();
  });

  it('reads a rule’s members as the keys they are referred to by', () => {
    const meta = parseRuleMeta(
      'rules/gravity',
      starterFile('gravityRule').contents,
    )!;
    const keys = memberKeys(meta);
    expect(keys).toContainEqual(key('AffectedByGravityTrait', 'trait'));
    expect(keys).toContainEqual(key('StrengthProperty', 'property'));
    expect(keys).toContainEqual(key('StartsFallingEvent', 'event'));
    expect(keys).toContainEqual(key('RestHeightOfQuery', 'query'));
    expect(keys.filter(k => k.kind === 'step').length).toBeGreaterThan(0);
    expect(duplicateMemberKeys(keys)).toEqual([]);
  });

  it('reports two members that would answer to one key', () => {
    expect(
      duplicateMemberKeys([
        key('StrengthProperty', 'property'),
        key('StrengthProperty', 'property'),
      ]),
    ).toEqual(['StrengthProperty']);
  });
});
