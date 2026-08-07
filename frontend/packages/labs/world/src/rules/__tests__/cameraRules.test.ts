// The camera rules, and what makes them compose.
//
// A camera's traits all want to write one thing — where it looks — so unlike an
// actor's they contend. The arrangement that makes several of them stack is:
// one rule owns a GOAL and the single step that acts on it, and everything else
// writes the goal in an earlier moment of the frame. `Camera` is that rule and
// `Camera Follow` is the first thing built on it.
//
// Nothing here names another rule's step. Adding easing or confinement later
// slots into `smooth` and `confine` and changes neither of these files.

import * as Blockly from 'blockly';
import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../../blockly/domainBlocks';
import {
  parseRuleMeta,
  ruleBodyKey,
  ruleMetaToModule,
} from '../../blockly/ruleMeta';
import {cameraRule} from '../stock/camera';
import {cameraFollowRule} from '../stock/cameraFollow';

/** A saved block, as much of one as this needs to walk it. */
interface SavedBlock {
  type?: string;
  inputs?: Record<string, {block?: SavedBlock; shadow?: SavedBlock}>;
  next?: {block?: SavedBlock; shadow?: SavedBlock};
}

/** Every block type a saved workspace names. */
function typesIn(contents: string): string[] {
  const parsed = JSON.parse(contents) as {blocks?: {blocks?: SavedBlock[]}};
  const found: string[] = [];
  const visit = (block: SavedBlock | undefined): void => {
    if (!block) {
      return;
    }
    if (block.type) {
      found.push(block.type);
    }
    for (const input of Object.values(block.inputs ?? {})) {
      visit(input.block);
      visit(input.shadow);
    }
    visit(block.next?.block);
    visit(block.next?.shadow);
  };
  (parsed.blocks?.blocks ?? []).forEach(visit);
  return found;
}

const camera = () => parseRuleMeta('rules/camera', cameraRule)!;
const follow = () => parseRuleMeta('rules/cameraFollow', cameraFollowRule)!;

describe('Camera — the base every camera rule builds on', () => {
  it('declares a camera trait carrying the goal', () => {
    const meta = camera();

    expect(meta.name).toBe('Camera');
    expect(meta.traits).toEqual([
      expect.objectContaining({id: 'Aimed', name: 'Aimed', subject: 'camera'}),
    ]);
    expect(meta.properties).toEqual([
      expect.objectContaining({
        id: 'goal',
        type: 'point',
        scope: 'camera',
        ownerTraitId: 'Aimed',
      }),
    ]);
  });

  it('takes the view in the last moment of the frame', () => {
    // Everything that decides where to look has run by then — including
    // anything that smoothed or confined the decision.
    expect(camera().steps).toEqual([
      expect.objectContaining({
        id: 'take_the_view',
        scope: 'camera',
        ownerTraitId: 'Aimed',
        order: {kind: 'phase', phase: 'view'},
      }),
    ]);
  });
});

describe('Camera Follow — the first rule built on it', () => {
  it('elects the base trait rather than redeclaring a goal', () => {
    const meta = follow();

    expect(meta.requires).toContain('Camera');
    expect(meta.traits).toEqual([
      expect.objectContaining({
        id: 'Follows',
        subject: 'camera',
        requires: ['Camera#AimedTrait'],
      }),
    ]);
    expect(meta.properties.map(p => p.id)).toEqual(['actor_to_follow']);
  });

  it('aims, and leaves moving the camera to Camera', () => {
    // The whole of why the two compose: this writes the goal in `aim`, the base
    // rule reads it in `view`, and the moments between are free for anything
    // that wants to shape the answer.
    expect(follow().steps).toEqual([
      expect.objectContaining({
        id: 'aim_at_the_actor',
        scope: 'camera',
        ownerTraitId: 'Follows',
        order: {kind: 'phase', phase: 'aim'},
      }),
    ]);
  });
});

describe('every block these rules name', () => {
  // The check that catches a hand-built workspace guessing a block type wrong.
  // A type nothing defines does not fail quietly — the project stops opening
  // with "Invalid block definition for type: …" — but it fails at RUN time,
  // and only for whoever imported the rule.
  //
  // The generated ones are the interesting half: a trait property's blocks are
  // named from its rule and its export (`world_get_Camera_GoalProperty`), so
  // renaming the rule or the property renames them too.
  const palette = new Set(
    buildDomainPalette([camera(), follow()], {allRuleModules: true}).blocks.map(
      block => block.type,
    ),
  );

  it('exists', () => {
    const missing: string[] = [];
    for (const [name, source] of [
      ['camera', cameraRule],
      ['cameraFollow', cameraFollowRule],
    ] as const) {
      for (const type of typesIn(source)) {
        // Ours, or Blockly's own, which importing blockly registers.
        if (!palette.has(type) && !Blockly.Blocks[type]) {
          missing.push(`${name}: ${type}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it('includes the generated property blocks, not just the fixed ones', () => {
    // A guard on the guard: if the walk missed the nested value blocks, the
    // test above would pass for a workspace naming anything at all.
    const named = new Set([
      ...typesIn(cameraRule),
      ...typesIn(cameraFollowRule),
    ]);

    expect(named).toContain('world_get_Camera_GoalProperty');
    expect(named).toContain('world_set_Camera_GoalProperty');
    expect(named).toContain('world_get_CameraFollow_ActorToFollowProperty');
    expect(named).toContain('world_get_Space_PositionProperty');
    expect(named).toContain('world_this_camera');
  });
});

describe('the module a camera rule generates', () => {
  // Bodies come from live blocks, so they are supplied here; what this checks
  // is the scaffolding `ruleMetaToModule` wraps around one — the loop, the
  // subject it binds, and the phase it runs in.
  const withBody = (
    meta: ReturnType<typeof camera>,
    scope: 'camera',
    trait: string,
    step: string,
    body: string,
  ) =>
    ruleMetaToModule(
      meta,
      new Map([[ruleBodyKey('step', scope, trait, step), {params: [], body}]]),
    );

  it('walks the cameras that have the trait, and binds each one', () => {
    const code = withBody(
      camera(),
      'camera',
      'Aimed',
      'take_the_view',
      'camera.set(WorldLab.PositionProperty, here);\n',
    );

    expect(code).toContain('rule.addStepIn("take_the_view", "view"');
    expect(code).toContain(
      'for (const camera of world.cameras.with(AimedTrait))',
    );
    expect(code).toContain('camera.set(WorldLab.PositionProperty, here);');
  });

  it('aims in its own moment, naming no other rule', () => {
    const code = withBody(
      follow(),
      'camera',
      'Follows',
      'aim_at_the_actor',
      'camera.set(WorldLab.GoalProperty, there);\n',
    );

    expect(code).toContain('rule.addStepIn("aim_at_the_actor", "aim"');
    expect(code).toContain(
      'for (const camera of world.cameras.with(FollowsTrait))',
    );
    expect(code).not.toContain('.steps[');
  });
});
