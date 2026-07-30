import {describe, expect, it} from 'vitest';

import * as WorldLab from '../../engine';
import {CollisionRule, GravityRule} from '../../engine';
import {builtinRuleMeta, type RuleMeta} from '../ruleMeta';

// Derive metadata for a couple of the real built-in rules and assert it mirrors
// them — the shape the editor (trait dropdown, block generator) will consume,
// and that project `.rule` files will parse into.
describe('builtinRuleMeta', () => {
  const meta = (rule: (typeof WorldLab)[keyof typeof WorldLab]): RuleMeta =>
    builtinRuleMeta([rule as never], WorldLab as Record<string, unknown>)[0];

  it('describes a rule, its traits, and its world + actor members', () => {
    const gravity = meta(GravityRule);
    expect(gravity.id).toBe('gravity');
    expect(gravity.name).toBe('Has Gravity');
    expect(gravity.source).toBe('builtin');
    expect(gravity.ref).toEqual({source: 'builtin', exportName: 'GravityRule'});
    // Dependencies, by rule id.
    expect(new Set(gravity.requires)).toEqual(new Set(['motion', 'collision']));

    // Traits, valued by their world-lab export.
    expect(gravity.traits).toEqual(
      expect.arrayContaining([
        {
          id: 'affected',
          name: 'Affected by Gravity',
          ref: {source: 'builtin', exportName: 'AffectedByGravityTrait'},
        },
        {
          id: 'ground',
          name: 'Acts as Ground',
          ref: {source: 'builtin', exportName: 'GroundTrait'},
        },
      ]),
    );

    // World-scoped property (the rule's own).
    expect(gravity.properties).toContainEqual({
      id: 'strength',
      name: 'strength',
      type: 'number',
      default: 900,
      readonly: false,
      scope: 'world',
      ownerTraitId: undefined,
      ref: {source: 'builtin', exportName: 'StrengthProperty'},
    });
    // Actor-scoped property carries its owning trait id.
    expect(gravity.properties).toContainEqual(
      expect.objectContaining({
        id: 'falling',
        scope: 'actor',
        ownerTraitId: 'affected',
        readonly: true,
        ref: {source: 'builtin', exportName: 'FallingProperty'},
      }),
    );

    // A world action and an actor query, both by export.
    expect(gravity.actions).toContainEqual(
      expect.objectContaining({
        id: 'invert',
        scope: 'world',
        ref: {source: 'builtin', exportName: 'InvertAction'},
      }),
    );
    expect(gravity.queries).toContainEqual(
      expect.objectContaining({
        id: 'isOnGround',
        scope: 'actor',
        ownerTraitId: 'affected',
        returns: 'boolean',
        ref: {source: 'builtin', exportName: 'IsOnGroundQuery'},
      }),
    );

    // Events.
    expect(gravity.events.map(e => e.id).sort()).toEqual([
      'startsFalling',
      'stopsFalling',
    ]);
  });

  it('captures a world query with typed params (the touching predicate)', () => {
    const collision = meta(CollisionRule);
    const isTouching = collision.queries.find(q => q.id === 'isTouching');
    expect(isTouching?.returns).toBe('boolean');
    expect(isTouching?.params.map(p => p.type)).toEqual(['actor', 'actor']);
    expect(isTouching?.ref.exportName).toBe('IsTouchingQuery');
  });
});
