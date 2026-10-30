// A hat in an actor file about that actor's own property, compiled and
// played on the starter (specs/OWN_SUBJECTS_PLAN.md, step 3).

import {describe, expect, it} from 'vitest';

import {HEALTH_BAR_SUBJECT} from '../actors/stock/healthBar';
import {actorFile, actsLike, showAs} from '../actors/stock/workspace';
import {DEFAULT_PROJECT} from '../constants';
import type {Actor, GameEvent} from '../engine';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const SUBJECT = 'world_get_ActorsHealthBar_SubjectProperty';

/** `health ÷ most health` of `subject actor`. */
const healthLeft = () => {
  const of = (exportName: string) => ({
    block: {
      type: `world_get_Health_${exportName}`,
      inputs: {ACTOR: {block: {type: 'world_subject_actor'}}},
    },
  });
  return {
    block: {
      type: 'math_arithmetic',
      fields: {OP: 'DIVIDE'},
      inputs: {A: of('HealthProperty'), B: of('MostHealthProperty')},
    },
  };
};

/** `when ⟨subject⟩ is damaged: set fraction of ⟨this actor⟩ to …`. */
const HEARS_DAMAGE = {
  type: 'world_on_Health_IsDamagedEvent',
  fields: {SUBJECT},
  next: {
    block: {
      type: 'world_set_ActorsProgressBar_FractionProperty',
      inputs: {
        ACTOR: {shadow: {type: 'world_this_actor'}},
        VALUE: healthLeft(),
      },
    },
  },
};

/**
 * The starter with a Health Bar filled by its own hat, and three placed in
 * the level: one on the Player, one on nobody, and a Big Bar, which acts
 * like a Health Bar, on the Player.
 */
const project = () => {
  const files = projectFiles(DEFAULT_PROJECT.source);
  const level = JSON.parse(files['maps/main.map']) as {actors: object[]};
  const bar = (type: string, id: string, subject: string) => ({
    type,
    id,
    properties: {
      positional: {position: {x: 16, y: 16}},
      Health_Bar: {subject},
    },
  });
  level.actors.push(
    bar('actors/healthBar', 'OnPlayer', 'Player'),
    bar('actors/healthBar', 'OnNobody', ''),
    bar('actors/bigBar', 'Big', 'Player'),
  );
  return {
    ...files,
    'maps/main.map': JSON.stringify(level),
    'actors/healthBar.actor': actorFile(
      'Health Bar',
      [actsLike('actors/progressBar'), HEALTH_BAR_SUBJECT, showAs('health')],
      {handlers: [HEARS_DAMAGE]},
    ),
    'actors/bigBar.actor': actorFile('Big Bar', [actsLike('actors/healthBar')]),
  };
};

describe('a hat about the actor’s own property, in its file', () => {
  it('fills each bar from its own subject, and no other', async () => {
    const {world, modules, code} = await compileProject(project());
    expect(code['actors/healthBar']).toContain('actor.onOwnSubject(');
    world.tick(1 / 60);
    const named = (id: string) =>
      [...world.actors].find(actor => actor.id === id) as Actor;
    const health = modules['rules/health'];
    const member = (part: string) =>
      Object.entries(health).find(([name]) => name.includes(part))![1] as never;
    const fraction = modules['actors/progressBar'].FractionProperty as never;
    const shown = (id: string) => named(id).get(fraction) as unknown as number;

    named('Player').set(member('HealthProperty'), 1 as never);
    world.emit(member('IsDamaged') as GameEvent, named('Player'));
    world.tick(1 / 60);

    // `this actor` is the bar; `subject actor` the Player.
    expect(shown('OnPlayer')).toBeCloseTo(1 / 3);
    expect(shown('OnNobody')).toBe(1);
    // …and a kind that acts like the bar hears it too.
    expect(shown('Big')).toBeCloseTo(1 / 3);
  }, 60000);
});
