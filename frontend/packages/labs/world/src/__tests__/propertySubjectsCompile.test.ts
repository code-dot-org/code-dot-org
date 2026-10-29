// A hat about an actor property, or a kind, in a placement's code, compiled
// and played on the starter (specs/PROPERTY_SUBJECTS_PLAN.md, step 3).

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../constants';
import type {Actor, GameEvent} from '../engine';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const SCREEN = 'screens/main.screen';
const CURRENT = 'world_get_ScreensMain_CurrentPlayerProperty';

/** `set text of ⟨this actor⟩ to ⟨words⟩`. */
const says = (words: string) => ({
  type: 'world_set_ActorsLabel_TextProperty',
  inputs: {
    ACTOR: {shadow: {type: 'world_this_actor'}},
    VALUE: {shadow: {type: 'text', fields: {TEXT: words}}},
  },
});

/** The Scoreboard's own code: `when ⟨subject⟩ is damaged: say "hurt"`. */
const scoreboardHears = (subject: string) => ({
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_on_Health_IsDamagedEvent',
        fields: {SUBJECT: subject},
        x: 20,
        y: 20,
        next: {block: says('hurt')},
      },
    ],
  },
});

/**
 * The starter, its Main Screen holding `current player`, set to the Player
 * as the screen loads, and the Scoreboard hearing `subject`.
 */
const project = (subject: string, setsPlayer = true) => {
  const files = projectFiles(DEFAULT_PROJECT.source);
  const screen = JSON.parse(files[SCREEN]) as {
    properties?: object[];
    actors: Array<{id: string; blocks?: object}>;
    blocks?: {blocks: {blocks: object[]}};
  };
  screen.properties = [
    ...(screen.properties ?? []),
    {name: 'current player', type: 'actor', value: ''},
  ];
  screen.actors = screen.actors.map(actor =>
    actor.id === 'Scoreboard'
      ? {...actor, blocks: scoreboardHears(subject)}
      : actor,
  );
  if (setsPlayer) {
    const roots = screen.blocks?.blocks.blocks ?? [];
    roots.push({
      type: 'world_on_screen_loads',
      x: 400,
      y: 20,
      next: {
        block: {
          type: 'world_set_ScreensMain_CurrentPlayerProperty',
          inputs: {
            VALUE: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/player'},
              },
            },
          },
        },
      },
    });
    screen.blocks = {blocks: {...screen.blocks?.blocks, blocks: roots}};
  }
  return {...files, [SCREEN]: JSON.stringify(screen)};
};

const play = async (files: Record<string, string>) => {
  const {world, modules} = await compileProject(files);
  world.tick(1 / 60);
  const damaged = Object.entries(modules['rules/health']).find(([name]) =>
    name.includes('Damaged'),
  )![1] as unknown as GameEvent;
  const text = modules['actors/label'].TextProperty as never;
  const named = (id: string) =>
    [...world.actors].find(actor => actor.id === id) as Actor;
  return {
    world,
    scoreboard: () => named('Scoreboard').get(text) as unknown as string,
    hurt: (actor: Actor) => {
      world.emit(damaged, actor);
      world.tick(1 / 60);
    },
    player: () => named('Player'),
  };
};

describe('a hat about an actor property', () => {
  it('hears the actor the game set it to, from a placement’s own code', async () => {
    const {scoreboard, hurt, player} = await play(project(CURRENT));
    expect(scoreboard()).not.toBe('hurt');
    hurt(player());
    // `this actor` is still the Scoreboard: it is the one that says so.
    expect(scoreboard()).toBe('hurt');
  }, 60000);

  it('hears nothing while the game has not set it', async () => {
    const {scoreboard, hurt, player} = await play(project(CURRENT, false));
    hurt(player());
    expect(scoreboard()).not.toBe('hurt');
  }, 60000);
});

describe('a hat about an actor property, in the Main Screen’s own code', () => {
  it('is recorded by the builder and heard once the World exists', async () => {
    const files = project(CURRENT);
    const screen = JSON.parse(files[SCREEN]) as {
      actors: Array<{id: string; blocks?: object}>;
      blocks: {blocks: {blocks: object[]}};
    };
    // The Scoreboard says nothing of its own; the game tells it.
    screen.actors = screen.actors.map(actor =>
      actor.id === 'Scoreboard' ? {...actor, blocks: undefined} : actor,
    );
    screen.blocks.blocks.blocks.push({
      type: 'world_on_Health_IsDamagedEvent',
      fields: {SUBJECT: CURRENT},
      x: 800,
      y: 20,
      next: {
        block: {
          ...says('hurt'),
          inputs: {
            ...says('hurt').inputs,
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/scoreboard'},
              },
            },
          },
        },
      },
    });
    const {scoreboard, hurt, player} = await play({
      ...files,
      [SCREEN]: JSON.stringify(screen),
    });
    hurt(player());
    expect(scoreboard()).toBe('hurt');
  }, 60000);
});

describe('a hat about a kind, in a placement’s own code', () => {
  it('reaches the actor the World already held, and keeps `this actor`', async () => {
    const {scoreboard, hurt, player} = await play(
      project('actors/player', false),
    );
    hurt(player());
    expect(scoreboard()).toBe('hurt');
  }, 60000);
});
