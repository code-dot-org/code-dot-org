// "Chases somebody" — the row that has to be told who.
//
// Steering is the smallest rule that makes an actor BEHAVE: everything else in
// the library is about what happens to a thing, and this is a thing with an
// intention (`rules/stock/steering`). The trait alone does nothing, though,
// because `actor to chase` starts empty and stays empty until something says —
// so a learner who elects Chases and runs the game watches an enemy stand
// perfectly still, with nothing anywhere to explain it.
//
// SO THE ROW ASKS. Which actor to go after cannot be read off the project, and
// guessing it from where the sparkles were opened is the mistake the camera
// already made and taught (`enhance/cameraFollow`). This is the second user of
// that question, and the first that asks it on an ACTOR's behalf.
//
// WHAT IT WRITES:
//
//   actors/<target>.actor    define actor named ⟨…⟩
//                              use trait ⟨Steering#Chases⟩
//
//                            when ⟨this actor⟩ is created:
//                              set ⟨actor to chase⟩ of ⟨this actor⟩
//                                to ⟨first actor of ⟨any ⟨Player⟩⟩⟩
//
// WHEN IT IS CREATED, rather than every frame or once in the world. Every
// frame would be a question asked sixty times a second whose answer changed
// once; once in the world would aim the chasers that were there at the start
// and leave every later one standing, which is exactly what a spawner makes.
// The Eyeball in the jetpack level is wired this way by hand, and this is that
// wiring offered rather than copied (`fixtures/jetpack`).
//
// `first actor of`, because the property holds ONE actor and `any ⟨kind⟩` is a
// list. Handed the list directly the socket takes a value of the wrong shape:
// it still compiles, and the enemy still stands still.
//
// ASKED AGAIN, IT REPOINTS. An actor chases one thing, so "chase this one"
// said twice is a learner changing their mind rather than asking for a second
// hat — the same reading, and the same edit in place, that the camera makes of
// being aimed twice.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {authoredName} from '../../blockly/projectModules';
import {fileIdAt, filePath} from '../../runtime/projectFiles';

import {
  edit,
  electTraits,
  fileOf,
  importRules,
  kindOf,
  me,
  subjectOf,
  wears,
} from './actorPatch';
import type {Enhancement, EnhanceChoice, EnhanceTarget} from './enhancements';
import {addRoot, down, rootsOf, type BlockJson} from './patch';

const CHASES = 'Steering#ChasesTrait';
const CREATED_HAT = 'world_on_Space_CreatedEvent';
const SET_QUARRY = 'world_set_Steering_ActorToChaseProperty';

/**
 * The actors this one can be pointed at, as the field names them.
 *
 * ITSELF LEFT OUT, which is the one answer that is never meant: an actor told
 * to chase its own kind picks the nearest of them, which on the commonest
 * setup is the actor itself, and a hunter standing on its own spot is a bug
 * that looks like the trait not working.
 *
 * A world's own `define actor` blocks are offered only to an actor that world
 * defines, because `local:` ids are the world's and a `.actor` file cannot
 * name one (`blockly/localActors`).
 */
const actorsFor = (
  source: MultiFileSource,
  target: EnhanceTarget,
): EnhanceChoice[] => {
  const local = target.block
    ? rootsOf(
        source.files[fileIdAt(source, `${target.path}.world`) ?? '']
          ?.contents ?? '',
      )
        .filter(root => root.type === 'world_actor' && root.id)
        .map(root => ({
          value: `local:${String(root.id)}`,
          name: String(root.fields?.NAME ?? root.id),
        }))
    : [];
  const files = Object.keys(source.files)
    .map(id => ({id, path: filePath(source, id) ?? ''}))
    .filter(one => one.path.endsWith('.actor'))
    .map(one => ({
      value: one.path.replace(/\.actor$/, ''),
      name:
        authoredName(source.files[one.id].contents ?? '') ??
        (one.path.split('/').pop() ?? '').replace(/\.actor$/, ''),
    }));
  const self = target.block ? `local:${target.block}` : target.path;
  return [...local, ...files].filter(choice => choice.value !== self);
};

/** `first actor of ⟨any ⟨kind⟩⟩` — the property holds one, not a list. */
const firstOf = (actor: string) => ({
  block: {type: 'world_first_actor', inputs: {SOURCE: kindOf(actor)}},
});

/** The hat this adds: when it appears, it learns what it is after. */
const handler = (target: EnhanceTarget, actor: string): BlockJson => ({
  type: CREATED_HAT,
  inputs: {ACTOR: subjectOf(target)},
  next: {
    block: {
      type: SET_QUARRY,
      inputs: {ACTOR: me(), VALUE: firstOf(actor)},
    },
  },
});

/** Whether a block is the hat this wrote, about this actor. */
const isOurs = (target: EnhanceTarget) => (block: BlockJson) => {
  if (block.type !== CREATED_HAT) {
    return false;
  }
  const named = (block.inputs?.ACTOR as {block?: BlockJson} | undefined)?.block
    ?.fields?.ACTOR;
  const mine = target.block
    ? named === `local:${target.block}`
    : named === undefined;
  return mine && [...down(block)].some(row => row.type === SET_QUARRY);
};

/** Who that hat currently points at, if the file holds one. */
const aimedAt = (
  contents: string,
  target: EnhanceTarget,
): string | undefined => {
  for (const root of rootsOf(contents)) {
    if (!isOurs(target)(root)) {
      continue;
    }
    for (const row of down(root)) {
      if (row.type !== SET_QUARRY) {
        continue;
      }
      const value = (row.inputs?.VALUE as {block?: BlockJson} | undefined)
        ?.block;
      const source = (value?.inputs?.SOURCE as {block?: BlockJson} | undefined)
        ?.block;
      return source?.fields?.ACTOR as string | undefined;
    }
  }
  return undefined;
};

/** Aim the hat this wrote somewhere else, in place. */
const repoint = (
  contents: string,
  target: EnhanceTarget,
  actor: string,
): string => {
  const workspace = JSON.parse(contents) as {blocks?: {blocks?: BlockJson[]}};
  for (const root of workspace.blocks?.blocks ?? []) {
    if (!isOurs(target)(root)) {
      continue;
    }
    for (const row of down(root)) {
      if (row.type === SET_QUARRY) {
        row.inputs = {...row.inputs, VALUE: firstOf(actor)};
      }
    }
  }
  return JSON.stringify(workspace, null, 2);
};

export const chasesEnhancement: Enhancement = {
  id: 'chases',
  subject: 'actor',
  name: 'Chases somebody',
  description:
    'Sets this actor after another one, steering towards it every frame and stopping when it is close enough. How fast it goes and how near it gets are blocks in its file. In a room with walls to go round, Path is the smarter cousin — this one walks straight at what it is after.',
  brings: ['Chases', 'a line saying who'],
  asks: {
    label: 'Chasing',
    options: actorsFor,
  },
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      wears(contents, CHASES, root) &&
      answer !== undefined &&
      aimedAt(contents, target) === answer
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    if (answer === undefined) {
      return source;
    }
    const current = importRules(source, ['Steering']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    if (id === undefined) {
      return current;
    }
    return edit(current, id, contents => {
      const next = electTraits(contents, root, [CHASES]);
      return aimedAt(next, target) === undefined
        ? // Beside the definition rather than under it: a hat takes no
          // previous connection, and `DisableOrphansPlugin` grays out a
          // top-level block that has one along with everything below it.
          addRoot(next, handler(target, answer))
        : repoint(next, target, answer);
    });
  },
};
