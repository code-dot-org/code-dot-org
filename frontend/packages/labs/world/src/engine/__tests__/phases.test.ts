// Saying WHEN a step runs by naming the moment rather than a neighbour.
//
// The stock rules ship seven steps and five of them carried a cross-rule
// anchor: gravity said `before Physics ▸ reposition` to mean "this is a force",
// and a learner writing a second force had to discover Physics, find its step
// among every step in the project, and know that "before that one" was the
// answer. The order those anchors produce has names now, and naming one is all
// a rule has to do.
//
// Phases become ordinary edges (core/Scheduler), so they compose with the
// anchors rather than replacing them: `before`/`after` still say what they
// always said, for the rules that genuinely know a neighbour.

import {describe, expect, it} from 'vitest';

import {PHASES, phaseIndex, phasesFor} from '../core/phases';
import {Scheduler} from '../core/Scheduler';
import type {Step, StepOrder} from '../core/types';

const step = (id: string, order: StepOrder): Step => ({
  id,
  ownerId: 'test',
  order,
  run: () => {},
});

const inPhase = (id: string, phase: string): Step =>
  step(id, {kind: 'phase', phase, when: 'during'});

const near = (id: string, when: 'before' | 'after', phase: string): Step =>
  step(id, {kind: 'phase', phase, when});

/** Every ordering of `items` — the orders the rules might have loaded in. */
const permutations = <T>(items: readonly T[]): T[][] =>
  items.length <= 1
    ? [[...items]]
    : items.flatMap((item, i) =>
        permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(
          rest => [item, ...rest],
        ),
      );

describe('the frame’s named moments', () => {
  it('runs them in list order whatever order the rules loaded in', () => {
    // The property the anchors could not give: three rules that name only what
    // KIND of work they do, and never each other.
    const stages = [
      inPhase('applyVelocity', 'push'),
      inPhase('reposition', 'move'),
      inPhase('handleCollisions', 'react'),
    ];

    for (const order of permutations([0, 1, 2])) {
      const run = new Scheduler(order.map(i => stages[i]))
        .order()
        .map(s => s.id);

      expect(run, `loaded ${order.join(',')}`).toEqual([
        'applyVelocity',
        'reposition',
        'handleCollisions',
      ]);
    }
  });

  it('reproduces the order the stock rules hand-wire today', () => {
    // Not new behaviour — the same sequence those five anchors already
    // produce, with the anchors gone.
    const run = new Scheduler([
      inPhase('handleCollisions', 'react'),
      inPhase('resolve', 'settle'),
      inPhase('find', 'touch'),
      inPhase('reposition', 'move'),
      inPhase('applyVelocity', 'push'),
      inPhase('control', 'decide'),
      inPhase('keyEvents', 'sense'),
    ])
      .order()
      .map(s => s.id);

    expect(run).toEqual([
      'keyEvents',
      'control',
      'applyVelocity',
      'reposition',
      'find',
      'resolve',
      'handleCollisions',
    ]);
  });

  it('leaves two steps in one moment unordered', () => {
    // Arrow keys and gravity are both `before reposition` today, and both are
    // forces. They commute, and a phase says where they belong without
    // inventing an order between them that nobody asked for.
    const run = new Scheduler([
      inPhase('gravity', 'push'),
      inPhase('wind', 'push'),
      inPhase('reposition', 'move'),
    ])
      .order()
      .map(s => s.id);

    expect(run.slice(0, 2).sort()).toEqual(['gravity', 'wind']);
    expect(run[2]).toBe('reposition');
  });

  it('skips over moments nothing names', () => {
    // A world with no cameras beyond the default, and no collisions: the
    // phases between are empty and cost nothing.
    const run = new Scheduler([
      inPhase('takeView', 'view'),
      inPhase('keyEvents', 'sense'),
    ])
      .order()
      .map(s => s.id);

    expect(run).toEqual(['keyEvents', 'takeView']);
  });

  it('still honours an anchor, which phases do not replace', () => {
    // `before`/`after` name a NEIGHBOUR, and stay right where a rule really
    // does know one — cutting to a camera has to happen before that camera is
    // aimed, and the two are written together.
    const aim = inPhase('aim', 'aim');
    const run = new Scheduler([
      aim,
      step('cut', {kind: 'before', anchor: aim}),
      inPhase('takeView', 'view'),
    ])
      .order()
      .map(s => s.id);

    expect(run).toEqual(['cut', 'aim', 'takeView']);
  });

  it('leaves a step naming no such moment unordered, not first', () => {
    // A phase since renamed, or a typo in a hand-written rule. Unordered is the
    // weaker claim; putting it at the front would be a stronger one, and wrong.
    const run = new Scheduler([
      inPhase('reposition', 'move'),
      inPhase('mystery', 'not-a-phase'),
      inPhase('keyEvents', 'sense'),
    ])
      .order()
      .map(s => s.id);

    expect(run).toContain('mystery');
    expect(run.indexOf('keyEvents')).toBeLessThan(run.indexOf('reposition'));
  });
});

describe('which moments a subject takes part in', () => {
  it('offers a camera only the camera’s', () => {
    // `push` is not a thing a camera does, so a camera trait never sees it —
    // the nonsense is absent rather than discouraged.
    expect(phasesFor('camera').map(phase => phase.id)).toEqual([
      'choose',
      'aim',
      'smooth',
      'confine',
      'view',
    ]);
  });

  it('offers an actor only the actor’s', () => {
    expect(phasesFor('actor').map(phase => phase.id)).toEqual([
      'decide',
      'push',
      'move',
      'touch',
      'settle',
      'react',
    ]);
  });

  it('offers a rule-level step all of them', () => {
    // Work that fits no single actor — reading the keyboard, walking every
    // pair of bodies — has no subject to be filtered by.
    expect(phasesFor('world')).toHaveLength(PHASES.length);
  });

  it('puts every camera moment after every actor moment', () => {
    // A camera following the player must read where the player ENDED the tick,
    // not where they were before collision moved them.
    const lastActor = Math.max(
      ...PHASES.filter(p => p.subject === 'actor').map(p => phaseIndex(p.id)!),
    );
    const firstCamera = Math.min(
      ...PHASES.filter(p => p.subject === 'camera').map(p => phaseIndex(p.id)!),
    );

    expect(lastActor).toBeLessThan(firstCamera);
  });
});

describe('the gaps around a moment', () => {
  // `during` places a step among peers; the gaps place it around all of them.
  // Both without naming a rule, which is the whole point.

  it('brackets a whole moment without naming anyone in it', () => {
    const run = new Scheduler([
      inPhase('gravity', 'push'),
      near('afterForces', 'after', 'push'),
      near('beforeForces', 'before', 'push'),
      inPhase('wind', 'push'),
    ])
      .order()
      .map(s => s.id);

    expect(run[0]).toBe('beforeForces');
    expect(run.slice(1, 3).sort()).toEqual(['gravity', 'wind']);
    expect(run[3]).toBe('afterForces');
  });

  it('orders two steps that belong in one moment and do not commute', () => {
    // The one thing a phase alone cannot say. An easing camera step and a
    // deadzone one both belong in `smooth` and give different answers in
    // different orders; the one that must run last says `just before` the next
    // moment, and still names no rule.
    const run = new Scheduler([
      near('ease', 'before', 'confine'),
      inPhase('deadzone', 'smooth'),
      inPhase('clampToMap', 'confine'),
    ])
      .order()
      .map(s => s.id);

    expect(run).toEqual(['deadzone', 'ease', 'clampToMap']);
  });

  it('puts the gap between the moments it separates', () => {
    // `after ⟨decide⟩` and `before ⟨push⟩` name the same gap from either side,
    // so both land there — after everything that decided, before anything that
    // pushes. They are unordered with each other, which is honest: nothing was
    // said about which comes first.
    const run = new Scheduler([
      inPhase('pushing', 'push'),
      near('afterDecide', 'after', 'decide'),
      near('beforePush', 'before', 'push'),
      inPhase('deciding', 'decide'),
    ])
      .order()
      .map(s => s.id);

    expect(run[0]).toBe('deciding');
    expect(run.slice(1, 3).sort()).toEqual(['afterDecide', 'beforePush']);
    expect(run[3]).toBe('pushing');
  });

  it('reads a step with no relation as being in the moment', () => {
    // What `{kind: "phase", phase}` meant before the relation existed, and
    // what an unset dropdown means.
    const run = new Scheduler([
      step('bare', {kind: 'phase', phase: 'push'}),
      near('after', 'after', 'push'),
      near('before', 'before', 'push'),
    ])
      .order()
      .map(s => s.id);

    expect(run).toEqual(['before', 'bare', 'after']);
  });
});
