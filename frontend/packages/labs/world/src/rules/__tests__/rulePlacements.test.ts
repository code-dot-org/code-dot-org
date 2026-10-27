// A rule's traits, renamed and deleted where actors are placed, and across
// the project (specs/RULE_EDITOR_PLAN.md, step 6).

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {
  deletePropertyInProject,
  deleteTrait,
  renameProperty,
  renameTrait,
  ruleDataOf,
  traitUses,
} from '../ruleEdits';
import {
  forgetPlacedProperty,
  renamePlacedProperty,
  renamePlacedTrait,
} from '../rulePlacements';
import {resolveRuleContents} from '../ruleReference';

const map = (contents: unknown): ProjectFile => ({
  id: 'm',
  name: 'level.map',
  folderId: '0',
  language: 'map',
  contents: JSON.stringify(contents),
});

/** A map whose one Ball is lighter than the rest, and a camera aimed. */
const placed = (): MultiFileSource => ({
  folders: {},
  files: {
    m: map({
      type: 'map',
      actors: [
        {
          type: 'actors/ball',
          id: 'b1',
          properties: {
            Affected_by_Gravity: {gravity_scale: 0.5, ignores_ground: true},
            positional: {position: {x: 1, y: 2}},
          },
        },
      ],
      mainCamera: {traits: ['Gravity#AffectedByGravityTrait']},
    }),
  },
  openFiles: [],
});

const actorsOf = (source: MultiFileSource) =>
  JSON.parse(source.files.m.contents) as {
    actors: Array<{properties: Record<string, Record<string, unknown>>}>;
    mainCamera: {traits: string[]};
  };

describe('a placement', () => {
  it('follows its trait’s property to a new name', () => {
    const next = actorsOf(
      renamePlacedProperty(
        placed(),
        'Affected by Gravity',
        'gravity scale',
        'weight',
      ),
    );
    expect(next.actors[0].properties.Affected_by_Gravity).toEqual({
      weight: 0.5,
      ignores_ground: true,
    });
  });

  it('forgets a deleted property, and the trait with its last one', () => {
    let source = forgetPlacedProperty(
      placed(),
      'Affected by Gravity',
      'gravity scale',
    );
    source = forgetPlacedProperty(
      source,
      'Affected by Gravity',
      'ignores ground',
    );
    expect(actorsOf(source).actors[0].properties).toEqual({
      positional: {position: {x: 1, y: 2}},
    });
  });

  it('follows its trait to a new name, where it is named and overridden', () => {
    const next = actorsOf(
      renamePlacedTrait(
        placed(),
        {
          from: 'Gravity#AffectedByGravityTrait',
          to: 'Gravity#FallsTrait',
        },
        {from: 'Affected by Gravity', to: 'Falls'},
      ),
    );
    expect(Object.keys(next.actors[0].properties)).toEqual([
      'positional',
      'Falls',
    ]);
    expect(next.mainCamera.traits).toEqual(['Gravity#FallsTrait']);
  });

  it('is the same project when nothing it says changes', () => {
    const source = placed();
    expect(renamePlacedProperty(source, 'Can Move', 'velocity', 'speed')).toBe(
      source,
    );
  });
});

describe('a trait of a stock rule', () => {
  const STARTER = WORLD_SCENARIOS.simple.source;
  const fileOf = (name: string) =>
    Object.values(STARTER.files).find(file => file.name === name)!;
  const gravity = fileOf('gravity.rule');
  const withMap: MultiFileSource = {
    ...STARTER,
    files: {...STARTER.files, m: placed().files.m},
  };

  it('is found wherever it is named', () => {
    const uses = traitUses(
      withMap,
      gravity.id,
      'Gravity',
      'Affected by Gravity',
    );
    expect(uses).toContain('m');
    expect(uses).toContain(fileOf('player.actor').id);
  });

  it('is renamed in its rule, its holders, its users and its placements', () => {
    const next = renameTrait(
      withMap,
      gravity.id,
      'Affected by Gravity',
      'Falls',
    );
    const own = ruleDataOf(next.files[gravity.id].contents)!;
    expect(own.traits!.map(trait => trait.name)).toContain('Falls');
    const player = next.files[fileOf('player.actor').id].contents;
    expect(player).toContain('Gravity#FallsTrait');
    expect(player).not.toContain('Gravity#AffectedByGravityTrait');
    const jump = resolveRuleContents(
      next.files[fileOf('jump.rule').id].contents,
    );
    expect(jump).not.toContain('Gravity#AffectedByGravityTrait');
    expect(Object.keys(actorsOf(next).actors[0].properties)).toContain('Falls');
  });

  it('is refused a name another trait of the rule has', () => {
    expect(
      renameTrait(withMap, gravity.id, 'Affected by Gravity', 'Acts as Ground'),
    ).toBe(withMap);
  });

  it('is deleted with all it declared', () => {
    const data = ruleDataOf(gravity.contents)!;
    const next = deleteTrait(data, 'Acts as Ground');
    expect(next.traits!.map(trait => trait.name)).toEqual([
      'Affected by Gravity',
    ]);
  });

  it('takes a renamed property’s placements with it, and a deleted one’s away', () => {
    const renamed = renameProperty(
      withMap,
      gravity.id,
      'Affected by Gravity',
      'gravity scale',
      'weight',
    );
    expect(
      actorsOf(renamed).actors[0].properties.Affected_by_Gravity,
    ).toHaveProperty('weight', 0.5);
    const deleted = deletePropertyInProject(
      withMap,
      gravity.id,
      'Affected by Gravity',
      'ignores ground',
    );
    expect(
      actorsOf(deleted).actors[0].properties.Affected_by_Gravity,
    ).not.toHaveProperty('ignores_ground');
    const trait = ruleDataOf(deleted.files[gravity.id].contents)!.traits!.find(
      one => one.name === 'Affected by Gravity',
    )!;
    expect(trait.properties!.map(one => one.name)).not.toContain(
      'ignores ground',
    );
  });
});
