// Renaming a rule carries to everything that names it.
//
// The reference format has no room for a file, so a rule's name is the only
// handle anything has on it — and renaming one is therefore an edit to every
// file that refers to it. What is checked here is the two halves of that: every
// shape a reference takes gets rewritten, and nothing that merely says the same
// word does.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {projectRuleMetas} from '../projectModules';
import {renameRuleInSource, renameRuleReferences} from '../renameRule';
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
    expect(next.files.ground.contents).toBe(source.files.ground.contents);
  });

  it('leaves the project resolvable — the rule answers to its new name', () => {
    const next = renameRuleInSource(source, 'Gravity', 'Moon Gravity');
    const metas = projectRuleMetas(projectFiles(next));
    expect(metas.map(meta => meta.name)).toContain('Moon Gravity');
    expect(metas.map(meta => meta.name)).not.toContain('Gravity');
    // And what named it now names it by the new name, at the same module.
    const gravity = parseRuleMeta(
      'rules/gravity',
      next.files.gravityRule.contents,
    )!;
    expect(gravity.modulePath).toBe('rules/gravity');
    const arrows = parseRuleMeta(
      'rules/arrows',
      next.files.arrowsRule.contents,
    )!;
    expect(arrows.requires).not.toContain('Gravity');
  });

  it('hands back the same source when nothing named the rule', () => {
    expect(renameRuleInSource(source, 'Nothing', 'Something')).toBe(source);
  });
});
