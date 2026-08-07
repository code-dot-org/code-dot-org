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
import {PHASES} from '../../engine/core/phases';
import {cameraRule} from '../stock/camera';
import {cameraConfinedRule} from '../stock/cameraConfined';
import {cameraDeadzoneRule} from '../stock/cameraDeadzone';
import {cameraEaseRule} from '../stock/cameraEase';
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
const ease = () => parseRuleMeta('rules/cameraEase', cameraEaseRule)!;
const confined = () =>
  parseRuleMeta('rules/cameraConfined', cameraConfinedRule)!;
const deadzone = () =>
  parseRuleMeta('rules/cameraDeadzone', cameraDeadzoneRule)!;

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
    buildDomainPalette([camera(), follow(), ease(), confined(), deadzone()], {
      allRuleModules: true,
    }).blocks.map(block => block.type),
  );

  it('exists', () => {
    const missing: string[] = [];
    for (const [name, source] of [
      ['camera', cameraRule],
      ['cameraFollow', cameraFollowRule],
      ['cameraEase', cameraEaseRule],
      ['cameraConfined', cameraConfinedRule],
      ['cameraDeadzone', cameraDeadzoneRule],
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

describe('Camera Ease — shaping the goal, not setting it', () => {
  it('runs in the moment between aiming and confining', () => {
    expect(ease().steps).toEqual([
      expect.objectContaining({
        id: 'ease_toward_the_goal',
        scope: 'camera',
        ownerTraitId: 'Eases',
        order: {kind: 'phase', phase: 'smooth'},
      }),
    ]);
  });

  it('travels a fraction that depends on the frame time', () => {
    // It used to move `smoothness` of the way EVERY FRAME, which eases twice as
    // fast at 120fps as at 60 and lags on a slow frame. Nothing in the rule
    // referred to the frame time at all — which is exactly what this checks,
    // because the arithmetic around it looked perfectly reasonable.
    const named = new Set(typesIn(cameraEaseRule));

    expect(named).toContain('world_step_delta');
    expect(named).toContain('world_query_CameraEase_CaughtUpOverSecondsQuery');
  });

  it('names the correction, rather than writing it out per axis', () => {
    // Used once per axis, so it is a block for the reason rules/solid's clamp
    // is: written out twice it is a pile of arithmetic, named once it says what
    // it is for.
    const meta = ease();

    expect(meta.queries.map(query => query.name)).toEqual([
      'caught up over seconds',
    ]);
    expect(meta.queries[0].params.map(param => param.name)).toEqual([
      'smoothness',
      'seconds',
    ]);
  });

  it('compounds, so a frame rate change lands in the same place', () => {
    // The property the correction exists for, as arithmetic: easing at 120fps
    // for two frames must leave the same gap as one frame at 60. A multiply
    // (`smoothness x seconds x 60`) is the usual approximation and does not —
    // it overshoots, because easing compounds.
    const caughtUp = (smoothness: number, seconds: number) =>
      1 - (1 - smoothness) ** (seconds * 60);
    const remaining = (gap: number, factor: number) => gap * (1 - factor);

    const slow = remaining(1, caughtUp(0.2, 1 / 60));
    const fast = remaining(
      remaining(1, caughtUp(0.2, 1 / 120)),
      caughtUp(0.2, 1 / 120),
    );

    expect(fast).toBeCloseTo(slow, 12);
  });

  it('elects the base trait and adds one number', () => {
    const meta = ease();

    expect(meta.requires).toContain('Camera');
    expect(meta.traits[0].requires).toEqual(['Camera#AimedTrait']);
    expect(meta.properties).toEqual([
      expect.objectContaining({id: 'smoothness', type: 'number', default: 0.2}),
    ]);
  });
});

describe('Camera Confined — the view stops at the edge of the map', () => {
  it('runs after anything that shaped the goal', () => {
    expect(confined().steps).toEqual([
      expect.objectContaining({
        id: 'keep_the_view_inside',
        scope: 'camera',
        ownerTraitId: 'Confined_to_the_Map',
        order: {kind: 'phase', phase: 'confine'},
      }),
    ]);
  });

  it('adds the clamp as a block of its own, as rules/solid does', () => {
    // Written out twice inline it is a nest of comparisons; named once it is a
    // sentence. Its two uses are the x and y axes.
    const meta = confined();

    expect(meta.queries.map(query => query.name)).toEqual(['kept between and']);
    expect(meta.queries[0].returns).toBe('number');
    expect(meta.queries[0].params.map(param => param.name)).toEqual([
      'value',
      'low',
      'high',
    ]);
  });

  it('reads the bounds rather than restating them', () => {
    // The map editor already knows how big the level is. A rule that made a
    // learner retype it would be wrong the moment they resized the map.
    const named = new Set(typesIn(cameraConfinedRule));

    expect(named).toContain('world_map_size');
    expect(named).toContain('world_view_size');
  });
});

describe('a camera that has elected Follows but been given nothing', () => {
  // The state EVERY such camera is in for at least one frame — `define camera`
  // with `use trait ⟨Follows⟩`, before anything sets `actor to follow`. It used
  // to throw `Cannot read properties of undefined (reading 'get')` every tick:
  // an `actors` property starts empty, a value read of several takes the first
  // (`WorldLab.one`), and the first of none is undefined.
  //
  // Doing nothing is the right answer rather than aiming somewhere by default.
  // The goal persists, so an unaimed camera holds the view where it is.

  it('guards the read rather than trusting the list', () => {
    const named = new Set(typesIn(cameraFollowRule));

    expect(named).toContain('world_any_actors');
    expect(named).toContain('controls_if');
  });

  it('asks before it reads, not after', () => {
    // The order matters and a set of block types cannot see it: the check has
    // to be the `if`'s condition, with the read inside its body.
    const parsed = JSON.parse(cameraFollowRule) as {
      blocks: {blocks: Array<Record<string, unknown>>};
    };
    const find = (
      node: unknown,
      type: string,
    ): Record<string, unknown> | undefined => {
      if (!node || typeof node !== 'object') {
        return undefined;
      }
      const here = node as Record<string, unknown>;
      if (here.type === type) {
        return here;
      }
      for (const [key, child] of Object.entries(here)) {
        if (key === 'fields' || key === 'extraState') {
          continue;
        }
        const found = find((child as {block?: unknown})?.block ?? child, type);
        if (found) {
          return found;
        }
      }
      return undefined;
    };

    const guard = find(parsed.blocks.blocks, 'controls_if')!;
    const inputs = guard.inputs as Record<string, {block?: {type?: string}}>;

    expect(inputs.IF0?.block?.type).toBe('world_any_actors');
    expect(find(inputs.DO0, 'world_set_Camera_GoalProperty')).toBeDefined();
    // …and the position read is inside the guarded body, not beside it.
    expect(
      find(inputs.IF0, 'world_get_Space_PositionProperty'),
    ).toBeUndefined();
    expect(find(inputs.DO0, 'world_get_Space_PositionProperty')).toBeDefined();
  });
});

describe('Camera Deadzone — the camera ignores small movements', () => {
  it('adjusts the aim in its own moment, before easing', () => {
    // `steady` exists because of this rule. A deadzone measures how far the aim
    // has moved from where the camera IS, so an easing step running first
    // shrinks that gap and the deadzone barely ever fires — they wanted the
    // same moment and do not commute.
    expect(deadzone().steps).toEqual([
      expect.objectContaining({
        id: 'ignore_small_movements',
        scope: 'camera',
        ownerTraitId: 'Has_a_Deadzone',
        order: {kind: 'phase', phase: 'steady'},
      }),
    ]);
  });

  it('runs before Ease, and Ease before Confined', () => {
    // The whole pipeline, ordered by the list rather than by any rule naming
    // another. Read off the phases the four rules actually declare.
    const order = PHASES.map(phase => phase.id);
    const at = (meta: ReturnType<typeof camera>) =>
      order.indexOf(meta.steps[0].order.phase!);

    expect(at(follow())).toBeLessThan(at(deadzone()));
    expect(at(deadzone())).toBeLessThan(at(ease()));
    expect(at(ease())).toBeLessThan(at(confined()));
    expect(at(confined())).toBeLessThan(at(camera()));
  });

  it('gives the box a width and a height, not one number', () => {
    // A platform camera wants more slack sideways than vertically — the player
    // walks about far more than they change height.
    const meta = deadzone();

    expect(meta.properties).toEqual([
      expect.objectContaining({id: 'slack', type: 'point'}),
    ]);
    expect(meta.traits[0].requires).toEqual(['Camera#AimedTrait']);
  });

  it('trails the target by the slack rather than snapping to it', () => {
    // What the block it adds computes, as arithmetic. Once the subject leaves
    // the box the camera sits exactly `slack` behind it, so the subject rests
    // on the edge it left and the next frame starts from there.
    const drag = (target: number, slack: number, here: number) =>
      target > here + slack
        ? target - slack
        : target < here - slack
          ? target + slack
          : here;

    expect(drag(100, 16, 0)).toBe(84); // left the box: 16 behind the target
    expect(drag(10, 16, 0)).toBe(0); // inside it: unmoved
    expect(drag(-100, 16, 0)).toBe(-84); // and the same the other way
    // Having moved, the subject is exactly the slack away — so a subject that
    // stops immediately does not drift any further.
    expect(drag(100, 16, 84)).toBe(84);
  });
});
