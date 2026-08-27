// The checks, against a lesson that has been DONE.
//
// A check that fails an unsolved project proves nothing on its own — so does a
// check that always fails. What has to be true is both halves: it refuses the
// starter the lesson ships with, and it accepts the project a learner has when
// they have finished. Nothing but a solved project can show the second, so each
// case here does the lesson, the way its instructions say to, and then plays
// the same script the sandbox would.
//
// The same runner the sandbox uses (`runtime/playCheck`), for the reason that
// module exists: a check tested against a different runner from the one that
// judges a learner is a check nobody has tested.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {playCheck} from '../../runtime/playCheck';
import {projectFiles} from '../../runtime/projectFiles';
import {tile} from '../index';
import {LESSONS} from '../lessons';
import type {TileId} from '../types';

/** Play a tile's check against a project and say whether it passes. */
const check = async (id: TileId, source: MultiFileSource) => {
  const {check: spec} = tile(id);
  if (!spec.run || !spec.passes) {
    throw new Error(`${id} has no check written`);
  }
  const {world} = await compileProject(projectFiles(source));
  const result = playCheck(world, spec.run);
  return {passes: spec.passes(result), result};
};

/**
 * A project with one file rewritten — how a solved lesson is expressed here.
 *
 * By NAME rather than by id: a project's file ids are numbers assigned in
 * order, and a test that named one would be a test about `buildProject`.
 */
const editing = (
  source: MultiFileSource,
  name: string,
  change: (contents: string) => string,
): MultiFileSource => {
  const entry = Object.entries(source.files).find(
    ([, file]) => file.name === name,
  );
  if (!entry) {
    throw new Error(`no file called ${name}`);
  }
  const [id, file] = entry;
  return {
    ...source,
    files: {...source.files, [id]: {...file, contents: change(file.contents)}},
  };
};

/**
 * Add a `use trait` row to an actor file that has none.
 *
 * The lesson's own instruction, carried out on the JSON: the actor's first row
 * gains a sibling. Written as a string edit because the alternative is
 * assembling a Blockly workspace by hand, which is what the fixtures do and
 * what this test is not about.
 */
const electing = (contents: string, trait: string): string => {
  const workspace = JSON.parse(contents) as {
    blocks: {blocks: Array<{next?: unknown}>};
  };
  const actor = workspace.blocks.blocks[0];
  actor.next = {
    block: {
      type: 'world_use_trait',
      fields: {TRAIT: trait},
      ...(actor.next ? {next: actor.next} : {}),
    },
  };
  return JSON.stringify(workspace);
};

describe('the gravity lesson’s check', () => {
  const lesson = LESSONS['motion/gravity'];

  it('refuses the project the lesson starts with', async () => {
    // Nothing has elected anything, so nothing falls — which is the lesson's
    // own first line, and a check that passed here would be checking nothing.
    const {passes} = await check('motion/gravity', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the project once the lesson is done', async () => {
    const solved = editing(
      editing(lesson.source, 'hero.actor', contents =>
        electing(contents, 'Gravity#AffectedByGravityTrait'),
      ),
      'ground.actor',
      contents => electing(contents, 'Gravity#ActsAsGroundTrait'),
    );
    const {passes, result} = await check('motion/gravity', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a Hero that falls forever, which is half the lesson', async () => {
    // Step one of the instructions without step two: it falls, and it keeps
    // falling straight through the floor. The check has to be able to tell the
    // difference between falling and LANDING, and one sample at the end cannot.
    const half = editing(lesson.source, 'hero.actor', contents =>
      electing(contents, 'Gravity#AffectedByGravityTrait'),
    );
    const {passes} = await check('motion/gravity', half);
    expect(passes).toBe(false);
  });
});

describe('the first world lesson’s check', () => {
  const lesson = LESSONS['origin/first-world'];

  it('refuses a world with one actor in it', async () => {
    const {passes} = await check('origin/first-world', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a world with a second actor that draws something', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {
        blocks: {blocks: Array<{next?: {block?: Record<string, unknown>}}>};
      };
      // Chain a second `add actor` under the first — the lesson's step two.
      let row = workspace.blocks.blocks[0].next?.block;
      while (row?.next) {
        row = (row.next as {block: Record<string, unknown>}).block;
      }
      if (row) {
        row.next = {
          block: {type: 'world_add_actor', fields: {ACTOR: 'actors/hero'}},
        };
      }
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('origin/first-world', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});
